import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MockHttpService } from '@/core/services/mock-http.service';
import { createId } from '@/core/util/id';
import { MockDbService } from '@/data/mock-db.service';
import { IndexedDbService } from '@/data/storage/indexeddb.service';
import type { Activity, ProofSubmission, ReviewDecision, SubmissionStatus } from '@/features/ranking/models';

export interface ProofSubmissionInput {
  activityId: string;
  unitId: string;
  descricaoComprovacao?: string;
  imageFile?: File | null;
}

@Injectable({ providedIn: 'root' })
export class SubmissionRepository {
  constructor(
    private readonly db: MockDbService,
    private readonly mockHttp: MockHttpService,
    private readonly imageStore: IndexedDbService
  ) {}

  list(): Observable<ProofSubmission[]> {
    return this.mockHttp.handle(() => [...this.db.submissions()]);
  }

  get(id: string): Observable<ProofSubmission | undefined> {
    return this.mockHttp.handle(() => this.db.submissions().find(submission => submission.id === id));
  }

  getByActivityAndUnit(activityId: string, unitId: string): Observable<ProofSubmission | undefined> {
    return this.mockHttp.handle(() =>
      this.db.submissions().find(submission => submission.activityId === activityId && submission.unitId === unitId)
    );
  }

  create(payload: ProofSubmissionInput): Observable<ProofSubmission> {
    return this.submitProof(payload);
  }

  update(id: string, payload: ProofSubmission): Observable<ProofSubmission> {
    return this.mockHttp.handle(() => {
      const submissions = this.db.submissions();
      const index = submissions.findIndex(submission => submission.id === id);
      if (index === -1) {
        throw new Error('Envio nao encontrado.');
      }
      const updated = { ...payload };
      const next = [...submissions];
      next[index] = updated;
      this.db.updateSubmissions(next);
      return updated;
    });
  }

  patch(id: string, payload: Partial<ProofSubmission>): Observable<ProofSubmission> {
    return this.mockHttp.handle(() => {
      const submissions = this.db.submissions();
      const index = submissions.findIndex(submission => submission.id === id);
      if (index === -1) {
        throw new Error('Envio nao encontrado.');
      }
      const next = { ...submissions[index], ...payload };
      const copy = [...submissions];
      copy[index] = next;
      this.db.updateSubmissions(copy);
      return next;
    });
  }

  delete(id: string): Observable<void> {
    return this.mockHttp.handle(() => {
      const submissions = this.db.submissions();
      const submission = submissions.find(item => item.id === id);
      if (submission?.imageId) {
        void this.imageStore.deleteImage(submission.imageId);
      }
      this.db.updateSubmissions(submissions.filter(item => item.id !== id));
    });
  }

  submitProof(payload: ProofSubmissionInput): Observable<ProofSubmission> {
    return this.mockHttp.handle(() => {
      if (payload.imageFile && !this.isAllowedImage(payload.imageFile)) {
        throw new Error('Formato de imagem invalido. Envie JPG ou PNG.');
      }

      const submissions = this.db.submissions();
      const existingIndex = submissions.findIndex(
        submission => submission.activityId === payload.activityId && submission.unitId === payload.unitId
      );
      const now = new Date().toISOString();
      const imageId = payload.imageFile ? createId('img') : undefined;

      if (payload.imageFile && imageId) {
        void this.imageStore.saveImage(imageId, payload.imageFile);
      }

      let submission: ProofSubmission;
      if (existingIndex === -1) {
        submission = {
          id: createId('sub'),
          activityId: payload.activityId,
          unitId: payload.unitId,
          status: 'PENDENTE_AVALIACAO',
          descricaoComprovacao: payload.descricaoComprovacao,
          imageId,
          submittedAt: now
        };
        this.db.updateSubmissions([submission, ...submissions]);
      } else {
        const existing = submissions[existingIndex];
        if (existing.imageId) {
          void this.imageStore.deleteImage(existing.imageId);
        }
        submission = {
          ...existing,
          status: 'PENDENTE_AVALIACAO',
          descricaoComprovacao: payload.descricaoComprovacao,
          imageId,
          submittedAt: now,
          reviewedAt: undefined,
          review: undefined,
          pontuacaoAprovada: undefined,
          pontuacaoBonusAprovada: undefined
        };
        const next = [...submissions];
        next[existingIndex] = submission;
        this.db.updateSubmissions(next);
      }

      return submission;
    });
  }

  reviewSubmission(id: string, decision: ReviewDecision): Observable<ProofSubmission> {
    return this.mockHttp.handle(() => {
      const submissions = this.db.submissions();
      const index = submissions.findIndex(submission => submission.id === id);
      if (index === -1) {
        throw new Error('Envio nao encontrado.');
      }
      const submission = submissions[index];
      const activity = this.db.activities().find(item => item.id === submission.activityId);
      if (!activity) {
        throw new Error('Atividade nao encontrada para avaliacao.');
      }

      let nextStatus: SubmissionStatus = submission.status;
      let next: ProofSubmission = { ...submission };

      if (decision.outcome === 'APROVADO') {
        nextStatus = 'CONCLUIDA';
        next = {
          ...submission,
          status: nextStatus,
          reviewedAt: decision.reviewedAt,
          review: decision,
          pontuacaoAprovada: decision.pontuacaoAjustada ?? activity.pontuacao,
          pontuacaoBonusAprovada: decision.pontuacaoBonusAjustada ?? activity.pontuacaoBonus
        };
      } else {
        nextStatus = 'SEM_COMPROVACAO';
        if (submission.imageId) {
          void this.imageStore.deleteImage(submission.imageId);
        }
        next = {
          ...submission,
          status: nextStatus,
          reviewedAt: decision.reviewedAt,
          review: decision,
          descricaoComprovacao: undefined,
          imageId: undefined,
          submittedAt: undefined,
          pontuacaoAprovada: undefined,
          pontuacaoBonusAprovada: undefined
        };
      }

      const updated = [...submissions];
      updated[index] = next;
      this.db.updateSubmissions(updated);
      return next;
    });
  }

  async loadImage(imageId: string): Promise<Blob | undefined> {
    return this.imageStore.getImage(imageId);
  }

  private isAllowedImage(file: File) {
    return ['image/jpeg', 'image/png'].includes(file.type);
  }
}
