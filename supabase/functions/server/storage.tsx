// Simple in-memory storage for development
// Simula Deno KV con un Map en memoria

class SimpleKV {
  private store: Map<string, any>;

  constructor() {
    this.store = new Map();
  }

  async get(key: any[]) {
    const keyStr = JSON.stringify(key);
    const value = this.store.get(keyStr);
    return { value: value || null };
  }

  async set(key: any[], value: any) {
    const keyStr = JSON.stringify(key);
    this.store.set(keyStr, value);
    return { ok: true };
  }

  async delete(key: any[]) {
    const keyStr = JSON.stringify(key);
    this.store.delete(keyStr);
    return { ok: true };
  }

  async *list(options: { prefix: any[] }) {
    const prefixStr = JSON.stringify(options.prefix);
    
    for (const [keyStr, value] of this.store.entries()) {
      if (keyStr.startsWith(prefixStr.slice(0, -1))) { // Remove trailing ]
        const key = JSON.parse(keyStr);
        yield { key, value };
      }
    }
  }

  clear() {
    this.store.clear();
  }

  size() {
    return this.store.size;
  }
}

// Create global instance
export const kv = new SimpleKV();

console.log("✅ Using in-memory storage (SimpleKV) for development");
