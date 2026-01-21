import { computed, Injectable, inject, signal } from '@angular/core';

import type { Activity, ProofSubmission, Unit } from '@/features/ranking/models';

import { LocalStorageService } from './storage/local-storage.service';
import { activitiesSeed, submissionsSeed, unitsSeed } from './seed';

export interface DbState {
  activities: Activity[];
  submissions: ProofSubmission[];
  units: Unit[];
}

const STORAGE_KEYS = {
  activities: 'cd.activities',
  submissions: 'cd.submissions',
  units: 'cd.units'
};

@Injectable({ providedIn: 'root' })
export class MockDbService {
  private readonly storage = inject(LocalStorageService);
  private readonly state = signal<DbState>({
    activities: [],
    submissions: [],
    units: []
  });

  readonly activities = computed(() => this.state().activities);
  readonly submissions = computed(() => this.state().submissions);
  readonly units = computed(() => this.state().units);

  constructor() {
    this.state.set(this.loadInitialState());
  }

  updateActivities(next: Activity[]) {
    this.updateState({ activities: next });
  }

  updateSubmissions(next: ProofSubmission[]) {
    this.updateState({ submissions: next });
  }

  updateUnits(next: Unit[]) {
    this.updateState({ units: next });
  }

  reset() {
    this.storage.set(STORAGE_KEYS.activities, activitiesSeed);
    this.storage.set(STORAGE_KEYS.submissions, submissionsSeed);
    this.storage.set(STORAGE_KEYS.units, unitsSeed);
    this.state.set({
      activities: [...activitiesSeed],
      submissions: [...submissionsSeed],
      units: [...unitsSeed]
    });
  }

  private updateState(partial: Partial<DbState>) {
    const next = { ...this.state(), ...partial };
    this.state.set(next);
    this.persist(next);
  }

  private loadInitialState(): DbState {
    const activities = this.storage.get<Activity[]>(STORAGE_KEYS.activities, []);
    const submissions = this.storage.get<ProofSubmission[]>(STORAGE_KEYS.submissions, []);
    const units = this.storage.get<Unit[]>(STORAGE_KEYS.units, []);

    if (!activities.length && !submissions.length && !units.length) {
      this.storage.set(STORAGE_KEYS.activities, activitiesSeed);
      this.storage.set(STORAGE_KEYS.submissions, submissionsSeed);
      this.storage.set(STORAGE_KEYS.units, unitsSeed);
      return {
        activities: [...activitiesSeed],
        submissions: [...submissionsSeed],
        units: [...unitsSeed]
      };
    }

    return {
      activities: activities.length ? activities : [...activitiesSeed],
      submissions: submissions.length ? submissions : [...submissionsSeed],
      units: units.length ? units : [...unitsSeed]
    };
  }

  private persist(state: DbState) {
    this.storage.set(STORAGE_KEYS.activities, state.activities);
    this.storage.set(STORAGE_KEYS.submissions, state.submissions);
    this.storage.set(STORAGE_KEYS.units, state.units);
  }
}
