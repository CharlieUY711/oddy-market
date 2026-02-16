/**
 * KV Store para Supabase Edge Functions
 * Proporciona una interfaz key-value para almacenar datos
 */

export interface KVStore {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

class SupabaseKVStore implements KVStore {
  private prefix: string;

  constructor(prefix: string = "") {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getKey(key);
      // Usar Deno KV si está disponible, sino usar localStorage simulado
      if (typeof Deno !== "undefined" && Deno.kv) {
        const result = await Deno.kv.get<T>(fullKey);
        return result.value;
      }
      // Fallback: usar variables globales (solo para desarrollo)
      const globalStore = (globalThis as any).__kv_store || {};
      const item = globalStore[fullKey];
      if (!item) return null;
      if (item.expires && item.expires < Date.now()) {
        delete globalStore[fullKey];
        return null;
      }
      return item.value as T;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      if (typeof Deno !== "undefined" && Deno.kv) {
        const options: any = {};
        if (ttl) {
          options.expireIn = ttl * 1000; // Deno KV usa milisegundos
        }
        await Deno.kv.set(fullKey, value, options);
      } else {
        // Fallback: usar variables globales
        const globalStore = (globalThis as any).__kv_store || {};
        globalStore[fullKey] = {
          value,
          expires: ttl ? Date.now() + ttl * 1000 : undefined,
        };
        (globalThis as any).__kv_store = globalStore;
      }
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      if (typeof Deno !== "undefined" && Deno.kv) {
        await Deno.kv.delete(fullKey);
      } else {
        const globalStore = (globalThis as any).__kv_store || {};
        delete globalStore[fullKey];
        (globalThis as any).__kv_store = globalStore;
      }
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  }

  async list(prefix: string): Promise<string[]> {
    try {
      const searchPrefix = this.getKey(prefix);
      if (typeof Deno !== "undefined" && Deno.kv) {
        const entries = [];
        for await (const entry of Deno.kv.list({ prefix: searchPrefix })) {
          entries.push(entry.key[0] as string);
        }
        return entries;
      } else {
        const globalStore = (globalThis as any).__kv_store || {};
        const keys = Object.keys(globalStore).filter((key) =>
          key.startsWith(searchPrefix)
        );
        return keys.map((key) => key.replace(searchPrefix + ":", ""));
      }
    } catch (error) {
      console.error(`Error listing prefix ${prefix}:`, error);
      return [];
    }
  }
}

export function createKVStore(prefix: string = ""): KVStore {
  return new SupabaseKVStore(prefix);
}

export const kv = createKVStore();
