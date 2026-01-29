import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { SessionService } from '@/core/services/session.service';
import { ActivityRepository } from '@/features/ranking/services/activity.repository';
import { SubmissionRepository } from '@/features/ranking/services/submission.repository';
import type { Activity, SubmissionStatus } from '@/features/ranking/models';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardDatePickerComponent } from '@/shared/components/date-picker';
import { ZardInputDirective } from '@/shared/components/input';
import { ZardSelectComponent } from '@/shared/components/select';
import { ZardSelectItemComponent } from '@/shared/components/select/select-item.component';
import { ZardIconComponent } from '@/shared/components/icon';
import { StatusBadgeComponent } from '@/shared/ui/status-badge.component';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog';
import { toast } from 'ngx-sonner';

type StatusFilter = 'TODOS' | SubmissionStatus;

@Component({
  selector: 'app-activities-page',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ZardButtonComponent,
    ZardCardComponent,
    ZardDatePickerComponent,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardIconComponent,
    StatusBadgeComponent
  ],
  template: `
    <section class="flex flex-col gap-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-muted-foreground">Ranking</p>
          <h2 class="text-3xl font-semibold">Atividades</h2>
          <p class="text-muted-foreground">Organize, acompanhe e envie comprovacoes.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            z-button
            zType="outline"
            type="button"
            class="rounded-full p-2"
            [attr.aria-pressed]="filtersOpen()"
            aria-label="Filtrar"
            (click)="toggleFilters()"
          >
            <z-icon zType="list-filter-plus" class="h-4 w-4" /> Filtros
          </button>
          @if (isDiretoria()) {
            <a z-button routerLink="/ranking/atividades/nova">Nova atividade</a>
          }
        </div>
      </div>

      @if (filtersOpen()) {
        <z-card zTitle="Filtros" zDescription="Refine por nome, periodo e status">
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <label class="text-sm font-medium">Busca</label>
              <input
                z-input
                class="mt-2 w-full"
                placeholder="Nome ou descricao"
                [ngModel]="searchTerm()"
                (ngModelChange)="searchTerm.set($event)"
              />
            </div>
            <div>
              <label class="text-sm font-medium">Periodo inicial</label>
              <z-date-picker
                class="mt-2 w-full [&_button]:w-full"
                placeholder="Selecione"
                [value]="toDate(periodStart())"
                (dateChange)="periodStart.set(fromDate($event))"
              />
            </div>
            <div>
              <label class="text-sm font-medium">Periodo final</label>
              <z-date-picker
                class="mt-2 w-full [&_button]:w-full"
                placeholder="Selecione"
                [value]="toDate(periodEnd())"
                (dateChange)="periodEnd.set(fromDate($event))"
              />
            </div>
            <div>
              @if (!isDiretoria()) {
                <label class="text-sm font-medium">Status</label>
                <z-select class="mt-2 w-full" [zValue]="statusFilter()" (zSelectionChange)="setStatusFilter($event)">
                  <z-select-item zValue="TODOS">Todos</z-select-item>
                  <z-select-item zValue="SEM_COMPROVACAO">Sem comprovacao</z-select-item>
                  <z-select-item zValue="PENDENTE_AVALIACAO">Pendente</z-select-item>
                  <z-select-item zValue="CONCLUIDA">Concluida</z-select-item>
                </z-select>
              }
            </div>
          </div>
          <div class="mt-4 flex items-center justify-end">
            <button z-button zType="ghost" type="button" (click)="clearFilters()">Limpar filtros</button>
          </div>
        </z-card>
      }

      <div class="grid gap-4">
        @for (activity of filteredActivities(); track activity.id) {
          <z-card [zTitle]="activity.nome" [zDescription]="activity.descricao">
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between flex-wrap">
              <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>{{ activity.dataInicio }} - {{ activity.dataFinal }}</span>
                <span>Base: {{ activity.pontuacao }} pts</span>
                @if (activity.pontuacaoBonus) {
                  <span>Bonus: {{ activity.pontuacaoBonus }} pts</span>
                }
              </div>
              <div class="flex items-center gap-2">
                @if(!isDiretoria()) {
                  <app-status-badge [status]="statusFor(activity)" />
                }
                <a z-button [routerLink]="['/ranking/atividades', activity.id]" zType="outline">{{isDiretoria() ? 'Detalhes' : 'Abrir'}}</a>
                @if (isDiretoria()) {
                  <a z-button [routerLink]="['/ranking/atividades', activity.id, 'editar']" zType="ghost">Editar</a>
                  <button z-button zType="destructive" (click)="confirmDelete(activity)">Excluir</button>
                }
              </div>
            </div>
          </z-card>
        } @empty {
          <z-card zTitle="Nenhuma atividade">
            <p class="text-muted-foreground">Tente ajustar os filtros para ver resultados.</p>
          </z-card>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivitiesPageComponent {
  protected readonly searchTerm = signal('');
  protected readonly periodStart = signal('');
  protected readonly periodEnd = signal('');
  protected readonly statusFilter = signal<StatusFilter>('TODOS');
  protected readonly filtersOpen = signal(false);

  private readonly activityRepo = inject(ActivityRepository);
  private readonly submissionRepo = inject(SubmissionRepository);
  private readonly session = inject(SessionService);
  private readonly alertDialog = inject(ZardAlertDialogService);

  protected readonly activities = toSignal(this.activityRepo.list(), { initialValue: [] });
  protected readonly submissions = toSignal(this.submissionRepo.list(), { initialValue: [] });

  protected readonly isDiretoria = computed(() => this.session.profile() === 'DIRETORIA');

  protected readonly filteredActivities = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const start = this.toDate(this.periodStart()) ?? undefined;
    const end = this.toDate(this.periodEnd()) ?? undefined;
    const status = this.statusFilter();

    return this.activities()
      .filter(activity => {
        if (!term) {
          return true;
        }
        return (
          activity.nome.toLowerCase().includes(term) || activity.descricao.toLowerCase().includes(term)
        );
      })
      .filter(activity => {
        if (!start && !end) {
          return true;
        }
        const activityStart = this.toDate(activity.dataInicio);
        const activityEnd = this.toDate(activity.dataFinal);
        if (!activityStart || !activityEnd) {
          return false;
        }
        if (start && activityEnd < start) {
          return false;
        }
        if (end && activityStart > end) {
          return false;
        }
        return true;
      })
      .filter(activity => {
        if (status === 'TODOS') {
          return true;
        }
        return this.statusFor(activity) === status;
    });
  });

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

  setStatusFilter(value: string | string[]) {
    if (Array.isArray(value)) {
      return;
    }
    this.statusFilter.set(value as StatusFilter);
  }

  toggleFilters() {
    this.filtersOpen.update(value => !value);
  }

  clearFilters() {
    this.searchTerm.set('');
    this.periodStart.set('');
    this.periodEnd.set('');
    this.statusFilter.set('TODOS');
  }

  statusFor(activity: Activity): SubmissionStatus {
    if (this.isDiretoria()) {
      return this.getGeneralStatus(activity);
    }
    const unitId = this.session.unitId();
    const submission = this.submissions().find(
      item => item.activityId === activity.id && item.unitId === unitId
    );
    return submission?.status ?? 'SEM_COMPROVACAO';
  }

  confirmDelete(activity: Activity) {
    this.alertDialog.confirm({
      zTitle: 'Excluir atividade',
      zContent: 'Essa acao remove a atividade e todas as comprovacoes relacionadas.',
      zOkText: 'Excluir',
      zOkDestructive: true,
      zOnOk: () => {
        this.activityRepo.delete(activity.id).subscribe({
          next: () => toast.success('Atividade removida.'),
          error: err => toast.error(err?.message ?? 'Falha ao excluir.')
        });
      }
    });
  }

  private getGeneralStatus(activity: Activity): SubmissionStatus {
    const subs = this.submissions().filter(item => item.activityId === activity.id);
    if (subs.some(item => item.status === 'PENDENTE_AVALIACAO')) {
      return 'PENDENTE_AVALIACAO';
    }
    if (subs.some(item => item.status === 'CONCLUIDA')) {
      return 'CONCLUIDA';
    }
    return 'SEM_COMPROVACAO';
  }
}
