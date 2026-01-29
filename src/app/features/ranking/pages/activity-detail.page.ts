import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';

import { SessionService } from '@/core/services/session.service';
import { ActivityRepository } from '@/features/ranking/services/activity.repository';
import { SubmissionRepository } from '@/features/ranking/services/submission.repository';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardInputDirective } from '@/shared/components/input';
import { StatusBadgeComponent } from '@/shared/ui/status-badge.component';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-activity-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardCardComponent,
    ZardInputDirective,
    StatusBadgeComponent,
    DatePipe
  ],
  template: `
    <section class="flex flex-col gap-6">
      <a routerLink="/ranking/atividades" class="text-sm text-muted-foreground hover:text-foreground">← Voltar</a>

      @if (activity()) {
        <z-card [zTitle]="activity()!.nome" [zDescription]="activity()!.descricao">
          <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>
              {{ activity()!.dataInicio | date: 'dd/MM/yyyy' }} - {{ activity()!.dataFinal | date: 'dd/MM/yyyy' }}
            </span>
            <span>Base: {{ activity()!.pontuacao }} pts</span>
            @if (activity()!.pontuacaoBonus) {
              <span>Bonus: {{ activity()!.pontuacaoBonus }} pts</span>
            }
          </div>
        </z-card>
      }

      @if (!isDiretoria()) {
        <z-card zTitle="Status da minha unidade" zDescription="Acompanhe e reenvie comprovacao se necessario">
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-2">
              <app-status-badge [status]="currentStatus()" />
              @if (submission()?.review?.justificativaReprovacao) {
                <span class="text-sm text-destructive">
                  {{ submission()?.review?.justificativaReprovacao }}
                </span>
              }
            </div>

            @if (submission()?.review?.justificativaAjuste) {
              <p class="text-sm text-muted-foreground">
                Ajuste aplicado: {{ submission()?.review?.justificativaAjuste }}
              </p>
            }

            @if (storedImageUrl()) {
              <img
                [src]="storedImageUrl()!"
                alt="Comprovacao enviada"
                class="h-48 w-full rounded-xl object-cover"
              />
            }
          </div>
        </z-card>

        <z-card zTitle="Enviar comprovacao" zDescription="Obrigatorio para somar pontos no ranking">
          <form class="grid gap-4" [formGroup]="form" (ngSubmit)="submit()">
            <div>
              <label class="text-sm font-medium">Descricao da comprovacao</label>
              <textarea
                z-input
                class="mt-2 w-full"
                rows="4"
                formControlName="descricaoComprovacao"
                placeholder="Relate o que foi executado e quem participou"
              ></textarea>
              @if (form.controls.descricaoComprovacao.touched && form.controls.descricaoComprovacao.invalid) {
                <p class="mt-1 text-xs text-destructive">Informe uma descricao com ao menos 10 caracteres.</p>
              }
            </div>
            <div>
              <label class="text-sm font-medium">Imagem (opcional)</label>
              <input
                class="mt-2 w-full text-sm"
                type="file"
                accept="image/png,image/jpeg"
                (change)="onFileChange($event)"
              />
              @if (fileError()) {
                <p class="mt-1 text-xs text-destructive">{{ fileError() }}</p>
              }
              @if (previewUrl()) {
                <img [src]="previewUrl()!" alt="Preview" class="mt-3 h-40 w-full rounded-xl object-cover" />
              }
            </div>

            <button z-button type="submit" [disabled]="form.invalid || submitting()">
              {{ submitting() ? 'Enviando...' : 'Enviar comprovacao' }}
            </button>
          </form>
        </z-card>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityDetailPageComponent {
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly storedImageUrl = signal<string | null>(null);
  protected readonly fileError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly selectedFile = signal<File | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly activityRepo = inject(ActivityRepository);
  private readonly submissionRepo = inject(SubmissionRepository);
  private readonly session = inject(SessionService);
  private readonly fb = inject(FormBuilder);

  protected readonly activityId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id'))),
    { initialValue: null }
  );

  protected readonly activity = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      switchMap(id => (id ? this.activityRepo.get(id) : of(undefined)))
    ),
    { initialValue: undefined }
  );

  protected readonly submissions = toSignal(this.submissionRepo.list(), { initialValue: [] });

  protected readonly submission = computed(() => {
    const id = this.activityId();
    const unitId = this.session.unitId();
    if (!id || !unitId) {
      return undefined;
    }
    return this.submissions().find(item => item.activityId === id && item.unitId === unitId);
  });

  protected readonly isDiretoria = computed(() => this.session.profile() === 'DIRETORIA');
  protected readonly currentStatus = computed(() => this.submission()?.status ?? 'SEM_COMPROVACAO');

  protected readonly form = this.fb.group({
    descricaoComprovacao: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor() {
    effect(() => {
      const submission = this.submission();
      if (!submission?.imageId) {
        if (this.storedImageUrl()) {
          URL.revokeObjectURL(this.storedImageUrl()!);
        }
        this.storedImageUrl.set(null);
        return;
      }
      this.submissionRepo.loadImage(submission.imageId).then(blob => {
        if (!blob) {
          this.storedImageUrl.set(null);
          return;
        }
        if (this.storedImageUrl()) {
          URL.revokeObjectURL(this.storedImageUrl()!);
        }
        const url = URL.createObjectURL(blob);
        this.storedImageUrl.set(url);
      });
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.fileError.set(null);
    if (file && !['image/png', 'image/jpeg'].includes(file.type)) {
      this.fileError.set('Formato invalido. Envie JPG ou PNG.');
      this.selectedFile.set(null);
      return;
    }
    this.selectedFile.set(file);
    if (this.previewUrl()) {
      URL.revokeObjectURL(this.previewUrl()!);
    }
    if (file) {
      this.previewUrl.set(URL.createObjectURL(file));
    } else {
      this.previewUrl.set(null);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const activityId = this.activityId();
    const unitId = this.session.unitId();
    if (!activityId || !unitId) {
      return;
    }
    this.submitting.set(true);
    this.submissionRepo
      .submitProof({
        activityId,
        unitId,
        descricaoComprovacao: this.form.value.descricaoComprovacao ?? '',
        imageFile: this.selectedFile()
      })
      .subscribe({
        next: () => {
          toast.success('Comprovacao enviada.');
          this.form.reset();
          if (this.previewUrl()) {
            URL.revokeObjectURL(this.previewUrl()!);
          }
          this.previewUrl.set(null);
          this.selectedFile.set(null);
        },
        error: err => {
          toast.error(err?.message ?? 'Falha ao enviar.');
        },
        complete: () => this.submitting.set(false)
      });
  }
}
