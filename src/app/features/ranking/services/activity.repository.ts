import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MockHttpService } from '@/core/services/mock-http.service';
import { createId } from '@/core/util/id';
import { MockDbService } from '@/data/mock-db.service';
import type { Activity } from '@/features/ranking/models';

@Injectable({ providedIn: 'root' })
export class ActivityRepository {
  constructor(private readonly db: MockDbService, private readonly mockHttp: MockHttpService) {}

  list(): Observable<Activity[]> {
    return this.mockHttp.handle(() => [...this.db.activities()]);
  }

  get(id: string): Observable<Activity | undefined> {
    return this.mockHttp.handle(() => this.db.activities().find(activity => activity.id === id));
  }

  create(payload: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Observable<Activity> {
    return this.mockHttp.handle(() => {
      const now = new Date().toISOString();
      const activity: Activity = {
        ...payload,
        id: createId('act'),
        createdAt: now,
        updatedAt: now
      };
      this.db.updateActivities([activity, ...this.db.activities()]);
      return activity;
    });
  }

  update(id: string, payload: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Observable<Activity> {
    return this.mockHttp.handle(() => {
      const activities = this.db.activities();
      const index = activities.findIndex(activity => activity.id === id);
      if (index === -1) {
        throw new Error('Atividade nao encontrada.');
      }
      const existing = activities[index];
      const next: Activity = {
        ...existing,
        ...payload,
        updatedAt: new Date().toISOString()
      };
      const copy = [...activities];
      copy[index] = next;
      this.db.updateActivities(copy);
      return next;
    });
  }

  patch(id: string, payload: Partial<Activity>): Observable<Activity> {
    return this.mockHttp.handle(() => {
      const activities = this.db.activities();
      const index = activities.findIndex(activity => activity.id === id);
      if (index === -1) {
        throw new Error('Atividade nao encontrada.');
      }
      const existing = activities[index];
      const next: Activity = {
        ...existing,
        ...payload,
        updatedAt: new Date().toISOString()
      };
      const copy = [...activities];
      copy[index] = next;
      this.db.updateActivities(copy);
      return next;
    });
  }

  delete(id: string): Observable<void> {
    return this.mockHttp.handle(() => {
      const activities = this.db.activities().filter(activity => activity.id !== id);
      const submissions = this.db.submissions().filter(submission => submission.activityId !== id);
      this.db.updateActivities(activities);
      this.db.updateSubmissions(submissions);
    });
  }
}
