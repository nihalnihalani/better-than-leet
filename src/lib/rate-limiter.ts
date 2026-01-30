/**
 * Token Bucket Rate Limiter
 *
 * In-memory rate limiter using token bucket algorithm.
 * Suitable for single-instance deployment. For multi-instance,
 * replace with Upstash Redis implementation.
 */

export interface RateLimitConfig {
  tokens: number;      // Max requests per window
  window: number;      // Window in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;   // Time until reset in milliseconds
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

export class TokenBucketRateLimiter {
  private store = new Map<string, TokenBucket>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up old entries every 5 minutes
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * Check rate limit for a given key
   */
  check(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    let bucket = this.store.get(key);

    if (!bucket) {
      // New client - initialize with full tokens
      bucket = { tokens: config.tokens, lastRefill: now };
    }

    // Calculate token refill based on time elapsed
    const elapsed = now - bucket.lastRefill;
    const refillRate = config.tokens / config.window;
    const tokensToAdd = elapsed * refillRate;

    // Refill tokens (capped at max)
    bucket.tokens = Math.min(config.tokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      // Allow request - consume one token
      bucket.tokens -= 1;
      this.store.set(key, bucket);

      return {
        success: true,
        remaining: Math.floor(bucket.tokens),
        resetTime: Math.ceil((config.tokens - bucket.tokens) / refillRate)
      };
    }

    // Rate limited - calculate time until next token
    this.store.set(key, bucket);
    const timeUntilToken = Math.ceil((1 - bucket.tokens) / refillRate);

    return {
      success: false,
      remaining: 0,
      resetTime: timeUntilToken
    };
  }

  /**
   * Clean up old entries that haven't been accessed recently
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes

    for (const [key, bucket] of this.store.entries()) {
      if (now - bucket.lastRefill > maxAge) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get current store size (for monitoring)
   */
  getSize(): number {
    return this.store.size;
  }

  /**
   * Clear all rate limit data (for testing)
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Stop cleanup interval (for testing/shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance
export const rateLimiter = new TokenBucketRateLimiter();

// Rate limit configurations per endpoint
export const RATE_LIMIT_CONFIG: Record<string, RateLimitConfig> = {
  // Resource-intensive operations
  '/api/sandbox/create': { tokens: 5, window: 60000 },     // 5 per minute
  '/api/sandbox/execute': { tokens: 20, window: 60000 },   // 20 per minute
  '/api/sandbox/install': { tokens: 10, window: 60000 },   // 10 per minute
  '/api/sandbox/test': { tokens: 15, window: 60000 },      // 15 per minute

  // AI/External API operations
  '/api/analysis/review': { tokens: 10, window: 60000 },   // 10 per minute
  '/api/analysis/autofix': { tokens: 10, window: 60000 },  // 10 per minute
  '/api/analysis/coderabbit': { tokens: 10, window: 60000 }, // 10 per minute
  '/api/interview/report': { tokens: 5, window: 60000 },   // 5 per minute (resource-intensive)
  '/api/tts': { tokens: 15, window: 60000 },               // 15 per minute

  // Default for other endpoints
  'default': { tokens: 30, window: 60000 }                 // 30 per minute
};

/**
 * Get rate limit config for a path
 */
export function getRateLimitConfig(path: string): RateLimitConfig {
  // Exact match
  if (RATE_LIMIT_CONFIG[path]) {
    return RATE_LIMIT_CONFIG[path];
  }

  // Check for prefix match (for nested routes)
  for (const [configPath, config] of Object.entries(RATE_LIMIT_CONFIG)) {
    if (configPath !== 'default' && path.startsWith(configPath)) {
      return config;
    }
  }

  return RATE_LIMIT_CONFIG['default'];
}
