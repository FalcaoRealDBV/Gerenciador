import { computed, Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import { MockDbService } from '@/data/mock-db.service';
import type { ProofSubmission, Unit } from '@/features/ranking/models';

export interface RankingEntry {
  unit: Unit;
  total: number;
  concluidas: number;
  pendentes: number;
}

@Injectable({ providedIn: 'root' })
export class RankingRepository {
  private readonly rankingSignal = computed(() => this.computeRanking());

  constructor(private readonly db: MockDbService) {}

  getRanking(): Observable<RankingEntry[]> {
    return toObservable(this.rankingSignal);
  }

  getRankingSnapshot(): RankingEntry[] {
    return this.rankingSignal();
  }

  getRankingSnapshotForPeriod(range?: { start?: string; end?: string }): RankingEntry[] {
    return this.computeRanking(range);
  }

  private computeRanking(range?: { start?: string; end?: string }): RankingEntry[] {
    const units = this.db.units();
    const submissions = this.db.submissions();
    const activities = this.db.activities();
    const start = range?.start ? new Date(range.start) : null;
    const end = range?.end ? new Date(range.end) : null;

    const validActivities = activities.filter(activity => {
      if (!start && !end) {
        return true;
      }
      const activityStart = new Date(activity.dataInicio);
      const activityEnd = new Date(activity.dataFinal);
      if (start && activityEnd < start) {
        return false;
      }
      if (end && activityStart > end) {
        return false;
      }
      return true;
    });

    const entries = units.map(unit => {
      const unitSubs = submissions.filter(
        sub => sub.unitId === unit.id && validActivities.some(activity => activity.id === sub.activityId)
      );
      const concluidas = unitSubs.filter(sub => sub.status === 'CONCLUIDA');
      const pendentes = unitSubs.filter(sub => sub.status === 'PENDENTE_AVALIACAO');
      const total = concluidas.reduce((sum, submission) => {
        const activity = validActivities.find(item => item.id === submission.activityId);
        const base = submission.pontuacaoAprovada ?? activity?.pontuacao ?? 0;
        const bonus = submission.pontuacaoBonusAprovada ?? activity?.pontuacaoBonus ?? 0;
        return sum + base + bonus;
      }, 0);
      return {
        unit,
        total,
        concluidas: concluidas.length,
        pendentes: pendentes.length
      } as RankingEntry;
    });

    return entries.sort((a, b) => b.total - a.total);
  }
}
