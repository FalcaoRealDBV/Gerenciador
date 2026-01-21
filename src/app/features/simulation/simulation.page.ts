import { ChangeDetectionStrategy, Component, computed } from '@angular/core';

import { SessionService } from '@/core/services/session.service';
import { MockDbService } from '@/data/mock-db.service';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardSelectComponent } from '@/shared/components/select';
import { ZardSelectItemComponent } from '@/shared/components/select/select-item.component';
import { ZardBadgeComponent } from '@/shared/components/badge';

@Component({
  selector: 'app-simulation-page',
  standalone: true,
  imports: [ZardCardComponent, ZardSelectComponent, ZardSelectItemComponent, ZardBadgeComponent],
  template: `
    <section class="flex flex-col gap-6">
      <div class="flex flex-col gap-2">
        <p class="text-sm uppercase tracking-[0.3em] text-muted-foreground">Simulacao</p>
        <h2 class="text-3xl font-semibold">Controle de acesso</h2>
        <p class="text-muted-foreground">Troque o perfil e a unidade para validar o fluxo.</p>
      </div>

      <z-card zTitle="Perfil ativo" zDescription="Selecione como deseja navegar">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="text-sm font-medium">Perfil</label>
            <z-select class="mt-2 w-full" [zValue]="session.profile()" (zSelectionChange)="onProfileChange($event)">
              <z-select-item zValue="DIRETORIA">Diretoria</z-select-item>
              <z-select-item zValue="CONSELHEIRO">Conselheiro</z-select-item>
              <z-select-item zValue="DESBRAVADOR">Desbravador</z-select-item>
            </z-select>
          </div>

          <div>
            <label class="text-sm font-medium">Unidade</label>
            <z-select
              class="mt-2 w-full"
              [zValue]="session.unitId() ?? ''"
              [zDisabled]="session.profile() === 'DIRETORIA'"
              (zSelectionChange)="onUnitChange($event)"
            >
              @for (unit of units(); track unit.id) {
                <z-select-item [zValue]="unit.id">{{ unit.name }}</z-select-item>
              }
            </z-select>
            @if (session.profile() === 'DIRETORIA') {
              <p class="mt-2 text-xs text-muted-foreground">Diretoria nao precisa de unidade.</p>
            }
          </div>
        </div>

        <div class="mt-6 flex flex-wrap gap-2">
          <z-badge zType="secondary">Perfil: {{ session.profile() }}</z-badge>
          @if (session.unitId()) {
            <z-badge zType="secondary">Unidade: {{ unitLabel() }}</z-badge>
          }
        </div>
      </z-card>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimulationPageComponent {
  protected readonly units = computed(() => this.db.units());

  constructor(protected readonly session: SessionService, private readonly db: MockDbService) {}

  onProfileChange(profile: string | string[]) {
    if (Array.isArray(profile)) {
      return;
    }
    this.session.setProfile(profile as 'DIRETORIA' | 'CONSELHEIRO' | 'DESBRAVADOR');
  }

  onUnitChange(unitId: string | string[]) {
    if (Array.isArray(unitId)) {
      return;
    }
    this.session.setUnit(unitId);
  }

  unitLabel() {
    return this.db.units().find(unit => unit.id === this.session.unitId())?.name ?? '';
  }
}
