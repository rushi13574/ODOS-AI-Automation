export class DataCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private inFlight = new Map<string, Promise<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Gets data from cache if valid, otherwise fetches and caches it.
   * Also deduplicates simultaneous in-flight requests for the same key.
   */
  async getOrFetch<T>(key: string, fetcher: () => Promise<T>, ttl: number = this.defaultTTL): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);

    // 1. Return cached if valid
    if (cached && (now - cached.timestamp < ttl)) {
      return cached.data as T;
    }

    // 2. Return existing in-flight promise to prevent duplicates
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>;
    }

    // 3. Fetch fresh data
    const promise = fetcher()
      .then(data => {
        this.cache.set(key, { data, timestamp: Date.now() });
        this.inFlight.delete(key);
        return data;
      })
      .catch(err => {
        this.inFlight.delete(key);
        throw err;
      });

    this.inFlight.set(key, promise);
    return promise;
  }

  /**
   * Invalidate keys starting with a specific prefix.
   */
  invalidate(keyPrefix: string) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Update cache manually (e.g. optimistic updates).
   */
  setCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Get raw cached value if it exists and is fresh.
   */
  getCache<T>(key: string, ttl: number = this.defaultTTL): T | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp < ttl)) {
      return cached.data as T;
    }
    return null;
  }

  clear() {
    this.cache.clear();
    this.inFlight.clear();
  }
}

export const queryCache = new DataCache();
