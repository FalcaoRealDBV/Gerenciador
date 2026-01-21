import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ZardBadgeComponent } from '@/shared/components/badge';
import type { SubmissionStatus } from '@/features/ranking/models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [ZardBadgeComponent],
  template: `
    <z-badge [zType]="badgeType()" [class]="badgeClass()">
      {{ label() }}
    </z-badge>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  readonly status = input.required<SubmissionStatus>();

  readonly label = computed(() => {
    switch (this.status()) {
      case 'CONCLUIDA':
        return 'Concluida';
      case 'PENDENTE_AVALIACAO':
        return 'Pendente';
      default:
        return 'Sem comprovacao';
    }
  });

  readonly badgeType = computed(() => {
    switch (this.status()) {
      case 'CONCLUIDA':
        return 'default';
      case 'PENDENTE_AVALIACAO':
        return 'secondary';
      default:
        return 'outline';
    }
  });

  readonly badgeClass = computed(() => {
    switch (this.status()) {
      case 'CONCLUIDA':
        return 'bg-emerald-600 text-white';
      case 'PENDENTE_AVALIACAO':
        return 'bg-amber-200 text-amber-900';
      default:
        return 'text-muted-foreground';
    }
  });
}
