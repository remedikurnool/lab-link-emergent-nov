/**
 * Caching Utilities
 * Simple in-memory cache with TTL support
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class Cache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);

    this.store.set(key, {
      value,
      expiresAt,
    });
  }

  /**
   * Delete value from cache
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clean expired entries
   */
  clean(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

// Singleton instance
export const cache = new Cache();

// Clean expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.clean();
  }, 5 * 60 * 1000);
}

/**
 * Cache wrapper for async functions
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Check cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function
  const result = await fn();

  // Store in cache
  cache.set(key, result, ttl);

  return result;
}

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(prefix: string, ...params: any[]): string {
  return `${prefix}:${params.map((p) => JSON.stringify(p)).join(':')}`;
}

