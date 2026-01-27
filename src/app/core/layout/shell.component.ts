import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { SessionService } from '@/core/services/session.service';
import { MockDbService } from '@/data/mock-db.service';
import type { UserProfile } from '@/core/types/user-context';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardDropdownMenuComponent } from '@/shared/components/dropdown';
import { ZardDropdownMenuItemComponent } from '@/shared/components/dropdown/dropdown-item.component';
import { ZardAvatarComponent } from '@/shared/components/avatar';
import { ZardIconComponent } from '@/shared/components/icon';
import type { ZardIcon } from '@/shared/components/icon/icons';
import { ZardToastComponent } from '@/shared/components/toast';
import { DOCUMENT, isPlatformBrowser, NgClass } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

interface NavLink {
  label: string;
  path: string;
  icon: ZardIcon;
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
    ZardButtonComponent,
    ZardDropdownMenuComponent,
    ZardDropdownMenuItemComponent,
    ZardAvatarComponent,
    ZardIconComponent,
    ZardToastComponent
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent {
  protected readonly links: NavLink[] = [
    { label: 'Dashboard', path: '/', icon: 'layout-dashboard' },
    { label: 'Atividades', path: '/ranking/atividades', icon: 'activity' },
    { label: 'Avaliacoes', path: '/ranking/avaliacoes', icon: 'clipboard', roles: ['DIRETORIA'] },
    { label: 'Ranking', path: '/ranking/ranking', icon: 'badge-check', roles: ['DIRETORIA'] },
    { label: 'Simulacao', path: '/simulacao', icon: 'sparkles' }
  ];

  protected readonly profiles: { id: UserProfile; label: string }[] = [
    { id: 'DIRETORIA', label: 'Diretoria' },
    { id: 'CONSELHEIRO', label: 'Conselheiro' },
    { id: 'DESBRAVADOR', label: 'Desbravador' }
  ];

  private readonly session = inject(SessionService);
  private readonly db = inject(MockDbService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly isDarkMode = signal(false);

  protected readonly units = computed(() => this.db.units());
  protected readonly context = this.session.userContext;
  protected readonly isDiretoria = computed(() => this.session.profile() === 'DIRETORIA');

  constructor() {
    this.applyThemeFromStorage();
  }

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

  toggleDarkMode() {
    this.setDarkMode(!this.isDarkMode());
  }

  private applyThemeFromStorage() {
    if (!this.isBrowser) {
      return;
    }

    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    const shouldUseDark = stored === 'dark' || (!stored && prefersDark);
    this.setDarkMode(true);
  }

  private setDarkMode(isDark: boolean) {
    this.isDarkMode.set(isDark);
    if (!this.isBrowser) {
      return;
    }
    this.document.documentElement.classList.toggle('dark', isDark);
    this.document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
}