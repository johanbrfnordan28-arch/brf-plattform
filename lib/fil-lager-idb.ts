const DB_NAMN = "brf-fil-lager";
const STORE = "filer";

export type IdbSparadFil = {
  filnamn: string;
  mime: string;
  storlek: number;
  uppladdad: string;
  blob: Blob;
};

let dbPromise: Promise<IDBDatabase> | null = null;

function oppnaDb(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB saknas i webbläsaren."));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAMN, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error ?? new Error("Kunde inte öppna fillagret."));
      };
    });
  }
  return dbPromise;
}

async function korTransaktion<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await oppnaDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error ?? req.error);
    tx.onabort = () => reject(tx.error ?? new Error("Transaktionen avbröts."));
  });
}

export async function idbSparaFil(nyckel: string, fil: IdbSparadFil): Promise<void> {
  await korTransaktion("readwrite", (store) => store.put(fil, nyckel));
}

export async function idbHamtaFil(nyckel: string): Promise<IdbSparadFil | null> {
  const res = await korTransaktion<IdbSparadFil | undefined>("readonly", (store) =>
    store.get(nyckel),
  );
  return res ?? null;
}

export async function idbTaBortFil(nyckel: string): Promise<void> {
  await korTransaktion("readwrite", (store) => store.delete(nyckel));
}
