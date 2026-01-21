import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  get<T>(key: string, fallback: T): T {
    if (!this.isBrowser) {
      return fallback;
    }
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T) {
    if (!this.isBrowser) {
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string) {
    if (!this.isBrowser) {
      return;
    }
    localStorage.removeItem(key);
  }
}
