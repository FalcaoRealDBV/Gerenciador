import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RankingRepository } from '@/features/ranking/services/ranking.repository';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardDatePickerComponent } from '@/shared/components/date-picker';
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
    ZardDatePickerComponent,
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
            <z-date-picker
              class="mt-2 w-full [&_button]:w-full"
              placeholder="Selecione"
              [value]="toDate(periodStart())"
              (dateChange)="periodStart.set(fromDate($event))"
            />
          </div>
          <div>
            <label class="text-sm font-medium">Data final</label>
            <z-date-picker
              class="mt-2 w-full [&_button]:w-full"
              placeholder="Selecione"
              [value]="toDate(periodEnd())"
              (dateChange)="periodEnd.set(fromDate($event))"
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
        <div class="grid gap-4 md:hidden">
          @for (entry of ranking(); track entry.unit.id) {
            <div class="surface-solid border border-border/70 p-4">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Posicao {{ $index + 1 }}</p>
                  <p class="truncate text-base font-semibold">{{ entry.unit.name }}</p>
                </div>
                <z-badge zType="secondary">{{ entry.total }} pts</z-badge>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div class="rounded-lg border border-border/60 px-3 py-2">
                  <p class="text-xs text-muted-foreground">Concluidas</p>
                  <p class="font-semibold">{{ entry.concluidas }}</p>
                </div>
                <div class="rounded-lg border border-border/60 px-3 py-2">
                  <p class="text-xs text-muted-foreground">Pendentes</p>
                  <p class="font-semibold">{{ entry.pendentes }}</p>
                </div>
              </div>
            </div>
          } @empty {
            <div class="surface-solid border border-border/70 p-4 text-center text-sm text-muted-foreground">
              Sem dados suficientes para ranking.
            </div>
          }
        </div>

        <div class="hidden overflow-auto rounded-lg border border-border/40 md:block">
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

  protected toDate(value: string): Date | null {
    if (!value) {
      return null;
    }
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) {
      return null;
    }
    return new Date(year, month - 1, day);
  }

  protected fromDate(value: Date | null): string {
    if (!value) {
      return '';
    }
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
