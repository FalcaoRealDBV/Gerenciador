import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RankingRepository } from '@/features/ranking/services/ranking.repository';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardInputDirective } from '@/shared/components/input';
import {
  ZardTableBodyComponent,
  ZardTableCellComponent,
  ZardTableComponent,
  ZardTableHeadComponent,
  ZardTableHeaderComponent,
  ZardTableRowComponent
} from '@/shared/components/table';

@Component({
  selector: 'app-ranking-board-page',
  standalone: true,
  imports: [
    FormsModule,
    ZardCardComponent,
    ZardBadgeComponent,
    ZardInputDirective,
    ZardTableComponent,
    ZardTableHeaderComponent,
    ZardTableBodyComponent,
    ZardTableRowComponent,
    ZardTableHeadComponent,
    ZardTableCellComponent
  ],
  template: `
    <section class="flex flex-col gap-6">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-muted-foreground">Diretoria</p>
        <h2 class="text-3xl font-semibold">Ranking em tempo real</h2>
        <p class="text-muted-foreground">Atualiza automaticamente com cada aprovacao.</p>
      </div>

      <z-card zTitle="Filtro por periodo (opcional)">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="text-sm font-medium">Data inicio</label>
            <input
              class="mt-2 w-full"
              type="date"
              [ngModel]="periodStart()"
              (ngModelChange)="periodStart.set($event)"
              z-input
            />
          </div>
          <div>
            <label class="text-sm font-medium">Data final</label>
            <input
              class="mt-2 w-full"
              type="date"
              [ngModel]="periodEnd()"
              (ngModelChange)="periodEnd.set($event)"
              z-input
            />
          </div>
        </div>
      </z-card>

      <div class="grid gap-4 md:grid-cols-3">
        @for (entry of topThree(); track entry.unit.id) {
          <z-card [zTitle]="entry.unit.name" zDescription="Pontuacao total">
            <div class="flex items-end justify-between">
              <span class="text-3xl font-semibold">{{ entry.total }}</span>
              <z-badge zType="secondary">Top {{ $index + 1 }}</z-badge>
            </div>
          </z-card>
        }
      </div>

      <z-card zTitle="Tabela completa">
        <div class="overflow-auto">
          <table z-table class="min-w-full">
            <thead z-table-header>
              <tr z-table-row>
                <th z-table-head>Posicao</th>
                <th z-table-head>Unidade</th>
                <th z-table-head class="text-right">Pontos</th>
                <th z-table-head class="text-right">Concluidas</th>
                <th z-table-head class="text-right">Pendentes</th>
              </tr>
            </thead>
            <tbody z-table-body>
              @for (entry of ranking(); track entry.unit.id) {
                <tr z-table-row>
                  <td z-table-cell>{{ $index + 1 }}</td>
                  <td z-table-cell>{{ entry.unit.name }}</td>
                  <td z-table-cell class="text-right font-semibold">{{ entry.total }}</td>
                  <td z-table-cell class="text-right">{{ entry.concluidas }}</td>
                  <td z-table-cell class="text-right">{{ entry.pendentes }}</td>
                </tr>
              } @empty {
                <tr z-table-row>
                  <td z-table-cell colspan="5" class="text-center text-muted-foreground">
                    Sem dados suficientes para ranking.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </z-card>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RankingBoardPageComponent {
  protected readonly periodStart = signal('');
  protected readonly periodEnd = signal('');

  protected readonly ranking = computed(() =>
    this.repo.getRankingSnapshotForPeriod({
      start: this.periodStart() || undefined,
      end: this.periodEnd() || undefined
    })
  );
  protected readonly topThree = computed(() => this.ranking().slice(0, 3));

  constructor(private readonly repo: RankingRepository) {}
}
