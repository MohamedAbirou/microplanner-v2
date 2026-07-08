/**
 * Offline mutation queue backed by IndexedDB.
 *
 * When a mutation fails because the device is offline, the app enqueues a
 * serialisable description of it here. On reconnect, `flushOfflineQueue` replays
 * each entry against the GraphQL endpoint in order. This keeps quick actions
 * (complete task, log time, etc.) working while offline without losing them.
 *
 * Entries store the raw GraphQL `query` string + `variables` so they can be
 * replayed with a plain fetch — no Apollo document required at flush time.
 */

import { config } from '@microplanner/config';

const DB_NAME = 'microplanner-offline';
const STORE = 'mutations';
const DB_VERSION = 1;

export interface QueuedMutation {
  id: string;
  operationName: string;
  query: string;
  variables: Record<string, unknown>;
  createdAt: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
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

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const store = transaction.objectStore(STORE);
        const request = fn(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
  );
}

export async function enqueueMutation(
  entry: Omit<QueuedMutation, 'id' | 'createdAt'>
): Promise<void> {
  const record: QueuedMutation = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  await tx('readwrite', (store) => store.add(record));
  notifyChange();
}

export async function getQueuedMutations(): Promise<QueuedMutation[]> {
  try {
    const all = await tx<QueuedMutation[]>('readonly', (store) => store.getAll());
    return (all || []).sort((a, b) => a.createdAt - b.createdAt);
  } catch {
    return [];
  }
}

export async function countQueuedMutations(): Promise<number> {
  try {
    return await tx<number>('readonly', (store) => store.count());
  } catch {
    return 0;
  }
}

async function removeMutation(id: string): Promise<void> {
  await tx('readwrite', (store) => store.delete(id));
  notifyChange();
}

/**
 * Replay all queued mutations against the GraphQL endpoint. Returns the number
 * successfully flushed. Stops leaving an entry in place if the server rejects it
 * for a non-network reason (so a poison entry is dropped, not retried forever).
 */
export async function flushOfflineQueue(
  getToken?: () => Promise<string | null>
): Promise<number> {
  const queued = await getQueuedMutations();
  if (queued.length === 0) return 0;

  let flushed = 0;
  const token = getToken ? await getToken().catch(() => null) : null;

  for (const m of queued) {
    try {
      const res = await fetch(config.graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ query: m.query, variables: m.variables }),
      });
      // Network reached: whether it succeeded or was a validation error, the
      // request is "delivered" — drop it so we don't loop forever.
      if (res.ok) {
        await removeMutation(m.id);
        flushed++;
      } else if (res.status >= 400 && res.status < 500) {
        await removeMutation(m.id);
      } else {
        break; // server/5xx — keep and retry later
      }
    } catch {
      break; // still offline — stop, retry on next reconnect
    }
  }

  return flushed;
}

// Lightweight change notifier so UI (offline indicator) can react.
const listeners = new Set<() => void>();

export function onQueueChange(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notifyChange() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch {
      /* ignore */
    }
  });
}
