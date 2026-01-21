import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { SessionService } from '@/core/services/session.service';
import { MockDbService } from '@/data/mock-db.service';
import type { UserProfile } from '@/core/types/user-context';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardDropdownMenuComponent } from '@/shared/components/dropdown';
import { ZardDropdownMenuItemComponent } from '@/shared/components/dropdown/dropdown-item.component';
import { ZardAvatarComponent } from '@/shared/components/avatar';
import { ZardToastComponent } from '@/shared/components/toast';
import { NgClass } from '@angular/common';

interface NavLink {
  label: string;
  path: string;
  roles?: UserProfile[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgClass,
    ZardBadgeComponent,
    ZardDropdownMenuComponent,
    ZardDropdownMenuItemComponent,
    ZardAvatarComponent,
    ZardToastComponent
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent {
  protected readonly links: NavLink[] = [
    { label: 'Dashboard', path: '/' },
    { label: 'Atividades', path: '/ranking/atividades' },
    { label: 'Avaliacoes', path: '/ranking/avaliacoes', roles: ['DIRETORIA'] },
    { label: 'Ranking', path: '/ranking/ranking', roles: ['DIRETORIA'] },
    { label: 'Simulacao', path: '/simulacao' }
  ];

  protected readonly profiles: { id: UserProfile; label: string }[] = [
    { id: 'DIRETORIA', label: 'Diretoria' },
    { id: 'CONSELHEIRO', label: 'Conselheiro' },
    { id: 'DESBRAVADOR', label: 'Desbravador' }
  ];

  private readonly session = inject(SessionService);
  private readonly db = inject(MockDbService);

  protected readonly units = computed(() => this.db.units());
  protected readonly context = this.session.userContext;
  protected readonly isDiretoria = computed(() => this.session.profile() === 'DIRETORIA');

  canShowLink(link: NavLink): boolean {
    if (!link.roles?.length) {
      return true;
    }
    return link.roles.includes(this.session.profile());
  }

  setProfile(profile: UserProfile) {
    this.session.setProfile(profile);
  }

  setUnit(unitId: string) {
    this.session.setUnit(unitId);
  }
}
