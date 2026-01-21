import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'cd-ranking';
const STORE_NAME = 'proof-images';
const DB_VERSION = 1;

@Injectable({ providedIn: 'root' })
export class IndexedDbService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private dbPromise: Promise<IDBPDatabase> | null = null;

  private getDb(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        }
      });
    }
    return this.dbPromise;
  }

  async saveImage(id: string, blob: Blob) {
    if (!this.isBrowser) {
      return;
    }
    const db = await this.getDb();
    await db.put(STORE_NAME, blob, id);
  }

  async getImage(id: string): Promise<Blob | undefined> {
    if (!this.isBrowser) {
      return undefined;
    }
    const db = await this.getDb();
    return db.get(STORE_NAME, id);
  }

  async deleteImage(id: string) {
    if (!this.isBrowser) {
      return;
    }
    const db = await this.getDb();
    await db.delete(STORE_NAME, id);
  }
}
