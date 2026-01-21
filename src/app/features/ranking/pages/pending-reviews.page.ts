import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { MockDbService } from '@/data/mock-db.service';
import { SubmissionRepository } from '@/features/ranking/services/submission.repository';
import type { Activity, ProofSubmission, Unit } from '@/features/ranking/models';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardInputDirective } from '@/shared/components/input';
import { ZardSelectComponent } from '@/shared/components/select';
import { ZardSelectItemComponent } from '@/shared/components/select/select-item.component';
import {
  ZardTableBodyComponent,
  ZardTableCellComponent,
  ZardTableComponent,
  ZardTableHeadComponent,
  ZardTableHeaderComponent,
  ZardTableRowComponent
} from '@/shared/components/table';
import { ZardDialogService } from '@/shared/components/dialog';
import { ReviewDialogComponent } from '@/features/ranking/components/review-dialog.component';

interface PendingRow {
  submission: ProofSubmission;
  activity: Activity;
  unit: Unit;
}

@Component({
  selector: 'app-pending-reviews-page',
  standalone: true,
  imports: [
    FormsModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectItemComponent,
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
        <h2 class="text-3xl font-semibold">Avaliacoes pendentes</h2>
        <p class="text-muted-foreground">Analise as comprovacoes enviadas pelas unidades.</p>
      </div>

      <z-card zTitle="Filtros" zDescription="Ordene por unidade, atividade ou data">
        <div class="grid gap-4 md:grid-cols-3">
          <div>
            <label class="text-sm font-medium">Unidade</label>
            <z-select class="mt-2 w-full" [zValue]="unitFilter()" (zSelectionChange)="setUnitFilter($event)">
              <z-select-item zValue="">Todas</z-select-item>
              @for (unit of units(); track unit.id) {
                <z-select-item [zValue]="unit.id">{{ unit.name }}</z-select-item>
              }
            </z-select>
          </div>
          <div>
            <label class="text-sm font-medium">Atividade</label>
            <z-select class="mt-2 w-full" [zValue]="activityFilter()" (zSelectionChange)="setActivityFilter($event)">
              <z-select-item zValue="">Todas</z-select-item>
              @for (activity of activities(); track activity.id) {
                <z-select-item [zValue]="activity.id">{{ activity.nome }}</z-select-item>
              }
            </z-select>
          </div>
          <div>
            <label class="text-sm font-medium">Data envio</label>
            <input z-input class="mt-2 w-full" type="date" [(ngModel)]="dateFilter" />
          </div>
        </div>
      </z-card>

      <z-card zTitle="Pendencias">
        <div class="overflow-auto">
          <table z-table class="min-w-full">
            <thead z-table-header>
              <tr z-table-row>
                <th z-table-head>Unidade</th>
                <th z-table-head>Atividade</th>
                <th z-table-head>Enviado</th>
                <th z-table-head class="text-right">Acoes</th>
              </tr>
            </thead>
            <tbody z-table-body>
              @for (row of filteredRows(); track row.submission.id) {
                <tr z-table-row>
                  <td z-table-cell>{{ row.unit.name }}</td>
                  <td z-table-cell>{{ row.activity.nome }}</td>
                  <td z-table-cell>{{ row.submission.submittedAt || '-' }}</td>
                  <td z-table-cell class="text-right">
                    <button z-button zType="outline" (click)="openReview(row)">Avaliar</button>
                  </td>
                </tr>
              } @empty {
                <tr z-table-row>
                  <td z-table-cell colspan="4" class="text-center text-muted-foreground">
                    Nenhuma comprovacao pendente.
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
export class PendingReviewsPageComponent {
  protected readonly unitFilter = signal('');
  protected readonly activityFilter = signal('');
  protected dateFilter = '';

  private readonly submissionRepo = inject(SubmissionRepository);
  private readonly db = inject(MockDbService);
  private readonly dialog = inject(ZardDialogService);

  protected readonly submissions = toSignal(this.submissionRepo.list(), { initialValue: [] });
  protected readonly units = computed(() => this.db.units());
  protected readonly activities = computed(() => this.db.activities());

  protected readonly rows = computed(() => {
    return this.submissions()
      .filter(submission => submission.status === 'PENDENTE_AVALIACAO')
      .map(submission => {
        const activity = this.activities().find(item => item.id === submission.activityId);
        const unit = this.units().find(item => item.id === submission.unitId);
        if (!activity || !unit) {
          return null;
        }
        return { submission, activity, unit } as PendingRow;
      })
      .filter((row): row is PendingRow => !!row);
  });

  protected readonly filteredRows = computed(() => {
    const unit = this.unitFilter();
    const activity = this.activityFilter();
    const date = this.dateFilter ? new Date(this.dateFilter) : null;
    return this.rows().filter(row => {
      if (unit && row.unit.id !== unit) {
        return false;
      }
      if (activity && row.activity.id !== activity) {
        return false;
      }
      if (date && row.submission.submittedAt) {
        const submitted = new Date(row.submission.submittedAt);
        if (submitted.toDateString() !== date.toDateString()) {
          return false;
        }
      }
      return true;
    });
  });

  setUnitFilter(value: string | string[]) {
    if (Array.isArray(value)) {
      return;
    }
    this.unitFilter.set(value);
  }

  setActivityFilter(value: string | string[]) {
    if (Array.isArray(value)) {
      return;
    }
    this.activityFilter.set(value);
  }

  openReview(row: PendingRow) {
    this.dialog.create({
      zTitle: 'Avaliar comprovacao',
      zContent: ReviewDialogComponent,
      zData: row,
      zHideFooter: true,
      zWidth: '720px'
    });
  }
}
