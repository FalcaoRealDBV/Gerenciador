import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, switchMap } from 'rxjs';

import { ActivityRepository } from '@/features/ranking/services/activity.repository';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardInputDirective } from '@/shared/components/input';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-activity-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ZardButtonComponent, ZardCardComponent, ZardInputDirective],
  template: `
    <section class="flex flex-col gap-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-muted-foreground">Diretoria</p>
          <h2 class="text-3xl font-semibold">{{ isEdit() ? 'Editar atividade' : 'Nova atividade' }}</h2>
          <p class="text-muted-foreground">Cadastre atividades com periodo e pontuacao clara.</p>
        </div>
        <a z-button zType="outline" routerLink="/ranking/atividades">Voltar</a>
      </div>

      <z-card zTitle="Detalhes da atividade" zDescription="Campos obrigatorios marcados">
        <form class="grid gap-4 md:grid-cols-2" [formGroup]="form" (ngSubmit)="save()">
          <div class="md:col-span-2">
            <label class="text-sm font-medium">Nome *</label>
            <input z-input class="mt-2 w-full" formControlName="nome" placeholder="Ex: Trilha noturna" />
            @if (form.controls['nome'].touched && form.controls['nome'].invalid) {
              <p class="mt-1 text-xs text-destructive">Informe o nome da atividade.</p>
            }
          </div>

          <div class="md:col-span-2">
            <label class="text-sm font-medium">Descricao *</label>
            <textarea
              z-input
              class="mt-2 w-full"
              rows="4"
              formControlName="descricao"
              placeholder="Explique o objetivo e como comprovar"
            ></textarea>
            @if (form.controls['descricao'].touched && form.controls['descricao'].invalid) {
              <p class="mt-1 text-xs text-destructive">Descricao obrigatoria.</p>
            }
          </div>

          <div>
            <label class="text-sm font-medium">Data inicio *</label>
            <input z-input class="mt-2 w-full" type="date" formControlName="dataInicio" />
          </div>
          <div>
            <label class="text-sm font-medium">Data final *</label>
            <input z-input class="mt-2 w-full" type="date" formControlName="dataFinal" />
            @if (form.errors?.['periodoInvalido']) {
              <p class="mt-1 text-xs text-destructive">Data final deve ser maior ou igual a data inicio.</p>
            }
          </div>

          <div>
            <label class="text-sm font-medium">Pontuacao *</label>
            <input z-input class="mt-2 w-full" type="number" min="1" formControlName="pontuacao" />
          </div>
          <div>
            <label class="text-sm font-medium">Pontuacao bonus</label>
            <input z-input class="mt-2 w-full" type="number" min="0" formControlName="pontuacaoBonus" />
          </div>

          <div class="md:col-span-2 flex flex-wrap gap-2">
            <button z-button type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Salvando...' : 'Salvar atividade' }}
            </button>
            <a z-button zType="ghost" routerLink="/ranking/atividades">Cancelar</a>
          </div>
        </form>
      </z-card>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityFormPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly repo = inject(ActivityRepository);
  private readonly fb = inject(FormBuilder);

  protected readonly saving = signal(false);
  protected readonly activityId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id'))),
    { initialValue: null }
  );

  protected readonly isEdit = computed(() => !!this.activityId());

  protected readonly form = this.fb.group(
    {
      nome: ['', [Validators.required, Validators.maxLength(120)]],
      descricao: ['', [Validators.required, Validators.maxLength(500)]],
      dataInicio: ['', Validators.required],
      dataFinal: ['', Validators.required],
      pontuacao: [0, [Validators.required, Validators.min(1)]],
      pontuacaoBonus: [0, [Validators.min(0)]]
    },
    {
      validators: [this.validarPeriodo]
    }
  );

  constructor() {
    this.route.paramMap
      .pipe(
        map(params => params.get('id')),
        filter((id): id is string => !!id),
        switchMap(id => this.repo.get(id))
      )
      .subscribe(activity => {
        if (!activity) {
          return;
        }
        this.form.patchValue({
          nome: activity.nome,
          descricao: activity.descricao,
          dataInicio: activity.dataInicio,
          dataFinal: activity.dataFinal,
          pontuacao: activity.pontuacao,
          pontuacaoBonus: activity.pontuacaoBonus ?? 0
        });
      });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const payload = {
      nome: this.form.value.nome ?? '',
      descricao: this.form.value.descricao ?? '',
      dataInicio: this.form.value.dataInicio ?? '',
      dataFinal: this.form.value.dataFinal ?? '',
      pontuacao: Number(this.form.value.pontuacao),
      pontuacaoBonus: this.form.value.pontuacaoBonus ? Number(this.form.value.pontuacaoBonus) : undefined
    };

    const request$ = this.activityId()
      ? this.repo.update(this.activityId()!, payload)
      : this.repo.create(payload);

    request$.subscribe({
      next: () => {
        toast.success('Atividade salva com sucesso.');
        this.router.navigate(['/ranking/atividades']);
      },
      error: err => {
        this.saving.set(false);
        toast.error(err?.message ?? 'Falha ao salvar.');
      },
      complete: () => this.saving.set(false)
    });
  }

  private validarPeriodo(group: { value: { dataInicio?: string; dataFinal?: string } }) {
    const inicio = group.value.dataInicio ? new Date(group.value.dataInicio) : null;
    const fim = group.value.dataFinal ? new Date(group.value.dataFinal) : null;
    if (!inicio || !fim) {
      return null;
    }
    return fim >= inicio ? null : { periodoInvalido: true };
  }
}
