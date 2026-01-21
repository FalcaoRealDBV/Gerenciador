import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { SessionService } from '@/core/services/session.service';
import { MockDbService } from '@/data/mock-db.service';
import { ActivityRepository } from '@/features/ranking/services/activity.repository';
import { SubmissionRepository } from '@/features/ranking/services/submission.repository';
import { RankingRepository } from '@/features/ranking/services/ranking.repository';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardBadgeComponent } from '@/shared/components/badge';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, ZardCardComponent, ZardButtonComponent, ZardBadgeComponent],
  template: `
    <section class="flex flex-col gap-6">
      <div class="flex flex-col gap-2">
        <p class="text-sm uppercase tracking-[0.3em] text-muted-foreground">Visao geral</p>
        <h2 class="text-3xl font-semibold">Painel do Ranking</h2>
        <p class="text-muted-foreground">
          Ajuste rapido de atividades, acompanhamento das unidades e fluxo de aprovacao.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <z-card zTitle="Atividades cadastradas" zDescription="Total de atividades vigentes">
          <div class="flex items-end justify-between">
            <span class="text-4xl font-semibold">{{ activities().length }}</span>
            <z-badge zType="secondary">Ranking</z-badge>
          </div>
        </z-card>

        <z-card zTitle="Pendencias" [zDescription]="pendingDescription()">
          <div class="flex items-end justify-between">
            <span class="text-4xl font-semibold">{{ pendingCount() }}</span>
            <z-badge zType="secondary">Avaliacao</z-badge>
          </div>
        </z-card>

        <z-card zTitle="Pontuacao lider" zDescription="Unidade em destaque">
          <div class="flex items-end justify-between">
            <div>
              <span class="text-3xl font-semibold">{{ topUnit().total }}</span>
              <p class="text-sm text-muted-foreground">{{ topUnit().unit.name }}</p>
            </div>
            <z-badge zType="default">Top</z-badge>
          </div>
        </z-card>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <z-card zTitle="Atalhos">
          <div class="flex flex-wrap gap-2">
            <a z-button routerLink="/ranking/atividades" zType="default">Ver atividades</a>
            @if (isDiretoria()) {
              <a z-button routerLink="/ranking/atividades/nova" zType="outline">Nova atividade</a>
              <a z-button routerLink="/ranking/avaliacoes" zType="outline">Avaliar pendencias</a>
              <a z-button routerLink="/ranking/ranking" zType="outline">Ranking</a>
            } @else {
              <a z-button routerLink="/simulacao" zType="outline">Simulacao</a>
            }
          </div>
        </z-card>

        <z-card zTitle="Minha unidade" zDescription="Resumo rapido">
          <div class="flex flex-col gap-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Unidade</span>
              <span class="font-medium">{{ currentUnit()?.name ?? 'Diretoria' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Pendentes</span>
              <span class="font-medium">{{ pendentesDaUnidade() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Concluidas</span>
              <span class="font-medium">{{ concluidasDaUnidade() }}</span>
            </div>
          </div>
        </z-card>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  private readonly activityRepo = inject(ActivityRepository);
  private readonly submissionRepo = inject(SubmissionRepository);
  private readonly rankingRepo = inject(RankingRepository);
  private readonly session = inject(SessionService);
  private readonly db = inject(MockDbService);

  protected readonly activities = toSignal(this.activityRepo.list(), { initialValue: [] });
  protected readonly submissions = toSignal(this.submissionRepo.list(), { initialValue: [] });
  protected readonly ranking = toSignal(this.rankingRepo.getRanking(), { initialValue: [] });

  protected readonly isDiretoria = computed(() => this.session.profile() === 'DIRETORIA');
  protected readonly currentUnit = computed(() =>
    this.db.units().find(unit => unit.id === this.session.unitId())
  );

  protected readonly pendentesDiretoria = computed(
    () => this.submissions().filter(sub => sub.status === 'PENDENTE_AVALIACAO').length
  );

  protected readonly pendingCount = computed(() => {
    if (this.isDiretoria()) {
      return this.pendentesDiretoria();
    }
    return this.pendentesDaUnidade();
  });

  protected readonly pendingDescription = computed(() =>
    this.isDiretoria() ? 'Envios aguardando avaliacao' : 'Pendencias da sua unidade'
  );

  protected readonly pendentesDaUnidade = computed(() => {
    const unitId = this.session.unitId();
    if (!unitId) {
      return 0;
    }
    return this.submissions().filter(sub => sub.unitId === unitId && sub.status === 'PENDENTE_AVALIACAO').length;
  });

  protected readonly concluidasDaUnidade = computed(() => {
    const unitId = this.session.unitId();
    if (!unitId) {
      return 0;
    }
    return this.submissions().filter(sub => sub.unitId === unitId && sub.status === 'CONCLUIDA').length;
  });

  protected readonly topUnit = computed(() => {
    return (
      this.ranking()[0] ?? {
        unit: { id: 'sem-dados', name: 'Sem dados' },
        total: 0,
        concluidas: 0,
        pendentes: 0
      }
    );
  });
}
