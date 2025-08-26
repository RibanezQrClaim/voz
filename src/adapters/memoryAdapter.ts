export interface MemoryAdapter {
  get(ns: string, key: string): any | null;
  set(ns: string, key: string, value: any): void;
  remove(ns: string, key: string): void;
}

const memStore: Record<string, string> = {};

function buildKey(ns: string, key: string) {
  return `${ns}:${key}`;
}

export const memoryAdapter: MemoryAdapter = {
  get(ns, key) {
    const k = buildKey(ns, key);
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(k);
        return raw ? JSON.parse(raw) : null;
      }
    } catch {
      /* noop */
    }
    return memStore[k] ? JSON.parse(memStore[k]) : null;
  },
  set(ns, key, value) {
    const k = buildKey(ns, key);
    const serialized = JSON.stringify(value);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(k, serialized);
        return;
      }
    } catch {
      /* noop */
    }
    memStore[k] = serialized;
  },
  remove(ns, key) {
    const k = buildKey(ns, key);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(k);
        return;
      }
    } catch {
      /* noop */
    }
    delete memStore[k];
  }
};
