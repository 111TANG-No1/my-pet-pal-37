import { PetPhoto } from '@/types/pet';

const DB_NAME = 'pet-pal-photos';
const STORE = 'photos';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function savePhotosToIDB(photos: PetPhoto[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);
  photos.forEach(p => store.put(p));
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadPhotosFromIDB(petId: string): Promise<PetPhoto[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    req.onsuccess = () => {
      const all = req.result as PetPhoto[];
      resolve(all.filter(p => p.petId === petId).sort((a, b) => a.createdAt - b.createdAt));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deletePhotoFromIDB(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteAllPhotosForPet(petId: string): Promise<void> {
  const photos = await loadPhotosFromIDB(petId);
  const db = await openDB();
  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);
  photos.forEach(p => store.delete(p.id));
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
