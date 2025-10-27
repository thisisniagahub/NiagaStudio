// FIX: Added .ts extension to the import from types.ts to ensure correct module resolution.
import { GalleryItem } from '../types.ts';

const DB_NAME = 'KuficAI_DB';
const STORE_NAME = 'gallery';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Database error:', request.error);
            reject('Database error: ' + request.error);
        };

        request.onsuccess = (event) => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
                dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

export const saveToGallery = async (item: Omit<GalleryItem, 'id'>): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const newItem: GalleryItem = {
      ...item,
      id: `kufic-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    return new Promise((resolve, reject) => {
        const request = store.add(newItem);
        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('Failed to save item:', request.error);
          reject(request.error);
        }
    });
};

export const getGalleryItems = async (): Promise<GalleryItem[]> => {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as GalleryItem[]);
        request.onerror = () => {
          console.error('Failed to get items:', request.error);
          reject(request.error);
        }
    });
};

export const deleteFromGallery = async (id: string): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('Failed to delete item:', request.error);
          reject(request.error);
        }
    });
};
