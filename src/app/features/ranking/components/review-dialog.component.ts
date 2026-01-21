import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Z_MODAL_DATA, ZardDialogRef } from '@/shared/components/dialog';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardInputDirective } from '@/shared/components/input';
import { SubmissionRepository } from '@/features/ranking/services/submission.repository';
import type { Activity, ProofSubmission, ReviewDecision, Unit } from '@/features/ranking/models';
import { toast } from 'ngx-sonner';

export interface ReviewDialogData {
  submission: ProofSubmission;
  activity: Activity;
  unit: Unit;
}

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, ZardButtonComponent, ZardCardComponent, ZardInputDirective],
  template: `
    <div class="flex flex-col gap-4">
      <header>
        <p class="text-sm uppercase tracking-[0.3em] text-muted-foreground">Avaliacao</p>
        <h3 class="text-2xl font-semibold">{{ data.unit.name }}</h3>
        <p class="text-sm text-muted-foreground">{{ data.activity.nome }}</p>
      </header>

      <z-card zTitle="Evidencia enviada" zDescription="Descricao e imagem">
        <p class="text-sm text-muted-foreground">
          {{ data.submission.descricaoComprovacao || 'Sem descricao enviada.' }}
        </p>
        @if (imageUrl()) {
          <img [src]="imageUrl()!" alt="Comprovacao" class="mt-3 h-44 w-full rounded-xl object-cover" />
        }
      </z-card>

      <form class="grid gap-4" [formGroup]="form">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="text-sm font-medium">Pontuacao base</label>
            <input z-input class="mt-2 w-full" type="number" min="0" formControlName="pontuacao" />
          </div>
          <div>
            <label class="text-sm font-medium">Pontuacao bonus</label>
            <input z-input class="mt-2 w-full" type="number" min="0" formControlName="pontuacaoBonus" />
          </div>
        </div>
        <div>
          <label class="text-sm font-medium">Justificativa de ajuste</label>
          <textarea
            z-input
            class="mt-2 w-full"
            rows="3"
            formControlName="justificativaAjuste"
            placeholder="Obrigatorio se alterar pontuacao"
          ></textarea>
        </div>
        <div>
          <label class="text-sm font-medium">Justificativa de reprovacao</label>
          <textarea
            z-input
            class="mt-2 w-full"
            rows="3"
            formControlName="justificativaReprovacao"
            placeholder="Obrigatorio ao reprovar"
          ></textarea>
        </div>
      </form>

      <div class="flex flex-wrap justify-end gap-2">
        <button z-button zType="outline" (click)="dialogRef.close()">Cancelar</button>
        <button z-button zType="destructive" [disabled]="loading()" (click)="reprovar()">Reprovar</button>
        <button z-button [disabled]="loading()" (click)="aprovar()">Aprovar</button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewDialogComponent {
  protected readonly loading = signal(false);
  protected readonly imageUrl = signal<string | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly submissions = inject(SubmissionRepository);
  public readonly dialogRef = inject(ZardDialogRef<ReviewDialogComponent>);
  public readonly data = inject(Z_MODAL_DATA) as ReviewDialogData;

  protected readonly form = this.fb.group({
    pontuacao: [this.data.activity.pontuacao, [Validators.required, Validators.min(0)]],
    pontuacaoBonus: [this.data.activity.pontuacaoBonus ?? 0, [Validators.min(0)]],
    justificativaAjuste: [''],
    justificativaReprovacao: ['']
  });

  constructor() {
    if (this.data.submission.imageId) {
      void this.submissions.loadImage(this.data.submission.imageId).then(blob => {
        if (!blob) {
          this.imageUrl.set(null);
          return;
        }
        this.imageUrl.set(URL.createObjectURL(blob));
      });
    }
  }

  aprovar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const pontuacao = Number(this.form.value.pontuacao ?? 0);
    const pontuacaoBonus = Number(this.form.value.pontuacaoBonus ?? 0);
    const ajustou =
      pontuacao !== this.data.activity.pontuacao ||
      pontuacaoBonus !== (this.data.activity.pontuacaoBonus ?? 0);
    const justificativaAjuste = this.form.value.justificativaAjuste ?? '';

    if (ajustou && !justificativaAjuste.trim()) {
      toast.error('Justificativa obrigatoria para ajuste.');
      return;
    }

    const decision: ReviewDecision = {
      reviewerId: 'diretoria',
      outcome: 'APROVADO',
      pontuacaoAjustada: pontuacao,
      pontuacaoBonusAjustada: pontuacaoBonus || undefined,
      justificativaAjuste: ajustou ? justificativaAjuste : undefined,
      reviewedAt: new Date().toISOString()
    };

    this.loading.set(true);
    this.submissions.reviewSubmission(this.data.submission.id, decision).subscribe({
      next: () => {
        toast.success('Comprovacao aprovada.');
        this.dialogRef.close();
      },
      error: err => toast.error(err?.message ?? 'Falha ao aprovar.'),
      complete: () => this.loading.set(false)
    });
  }

  reprovar() {
    const justificativa = this.form.value.justificativaReprovacao ?? '';
    if (!justificativa.trim()) {
      toast.error('Justificativa obrigatoria para reprovar.');
      return;
    }
    const decision: ReviewDecision = {
      reviewerId: 'diretoria',
      outcome: 'REPROVADO',
      justificativaReprovacao: justificativa,
      reviewedAt: new Date().toISOString()
    };
    this.loading.set(true);
    this.submissions.reviewSubmission(this.data.submission.id, decision).subscribe({
      next: () => {
        toast.success('Comprovacao reprovada.');
        this.dialogRef.close();
      },
      error: err => toast.error(err?.message ?? 'Falha ao reprovar.'),
      complete: () => this.loading.set(false)
    });
  }
}
