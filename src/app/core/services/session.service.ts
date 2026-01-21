import { computed, Injectable, signal } from '@angular/core';

import type { UserContext, UserProfile } from '@/core/types/user-context';
import { MockDbService } from '@/data/mock-db.service';
import { LocalStorageService } from '@/data/storage/local-storage.service';

const STORAGE_KEY = 'cd.user-context';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly context = signal<UserContext>({
    profile: 'DIRETORIA',
    displayName: 'Diretoria'
  });

  readonly userContext = this.context.asReadonly();
  readonly profile = computed(() => this.context().profile);
  readonly unitId = computed(() => this.context().unitId);
  readonly displayName = computed(() => this.context().displayName);

  constructor(private readonly db: MockDbService, private readonly storage: LocalStorageService) {
    const stored = this.loadInitialContext();
    const unitId = stored.profile === 'DIRETORIA' ? undefined : stored.unitId ?? this.db.units()[0]?.id;
    this.context.set({ ...stored, unitId });
  }

  setProfile(profile: UserProfile) {
    const units = this.db.units();
    const unitId = profile === 'DIRETORIA' ? undefined : this.context().unitId ?? units[0]?.id;
    const displayName =
      profile === 'DIRETORIA' ? 'Diretoria' : profile === 'CONSELHEIRO' ? 'Conselheiro' : 'Desbravador';
    this.updateContext({ profile, unitId, displayName });
  }

  setUnit(unitId: string) {
    if (this.context().profile === 'DIRETORIA') {
      return;
    }
    this.updateContext({ unitId });
  }

  setDisplayName(displayName: string) {
    this.updateContext({ displayName });
  }

  updateContext(partial: Partial<UserContext>) {
    const next = { ...this.context(), ...partial };
    this.context.set(next);
    this.storage.set(STORAGE_KEY, next);
  }

  private loadInitialContext(): UserContext {
    const stored = this.storage.get<UserContext | null>(STORAGE_KEY, null);
    if (stored?.profile) {
      return stored;
    }
    return {
      profile: 'DIRETORIA',
      displayName: 'Diretoria'
    };
  }
}
