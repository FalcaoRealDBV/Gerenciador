import { Injectable, signal } from '@angular/core';
import { defer, delay, Observable, of, throwError } from 'rxjs';

export interface MockHttpConfig {
  latencyMs: number;
  errorRate: number;
}

const DEFAULT_CONFIG: MockHttpConfig = {
  latencyMs: 350,
  errorRate: 0
};

@Injectable({ providedIn: 'root' })
export class MockHttpService {
  private readonly config = signal<MockHttpConfig>({ ...DEFAULT_CONFIG });

  setConfig(partial: Partial<MockHttpConfig>) {
    this.config.update(current => ({ ...current, ...partial }));
  }

  handle<T>(fn: () => T, override?: Partial<MockHttpConfig>): Observable<T> {
    const { latencyMs, errorRate } = { ...this.config(), ...override };
    return defer(() => {
      if (Math.random() < errorRate) {
        return throwError(() => new Error('Falha simulada. Tente novamente.'));
      }
      return of(fn());
    }).pipe(delay(latencyMs));
  }
}
