/**
 * In-Process Rate Limiter (Sliding Window)
 *
 * Designed for Next.js API Route Handlers running on Node.js.
 * Uses an in-memory Map with automatic expiry. Appropriate for
 * single-instance deployments; for multi-instance, use Redis/Upstash.
 *
 * Usage:
 *   const limiter = getRateLimiter('login');
 *   const result = limiter.check(ipAddress);
 *   if (!result.allowed) return ApiResponse.rateLimited(requestId);
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

interface RateLimitConfig {
  /** Maximum number of requests allowed per window */
  maxRequests: number;
  /** Window size in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAfterMs: number;
}

const PRESETS: Record<string, RateLimitConfig> = {
  /** Auth: login — 10 per minute */
  login: { maxRequests: 10, windowMs: 60_000 },
  /** Auth: register — 5 per minute */
  register: { maxRequests: 5, windowMs: 60_000 },
  /** Auth: forgot-password — 3 per 60 minutes */
  'forgot-password': { maxRequests: 3, windowMs: 60 * 60_000 },
  /** Auth: reset-password — 5 per minute */
  'reset-password': { maxRequests: 5, windowMs: 60_000 },
  /** Assessment: start — 10 per minute */
  'assessment-start': { maxRequests: 10, windowMs: 60_000 },
  /** API: generic — 100 per minute */
  default: { maxRequests: 100, windowMs: 60_000 },
};

// Global store (survives request lifecycle within a Node.js process)
const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(name: string): Map<string, RateLimitEntry> {
  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  return stores.get(name)!;
}

export class RateLimiter {
  private store: Map<string, RateLimitEntry>;
  private config: RateLimitConfig;

  constructor(name: string, config?: RateLimitConfig) {
    this.store = getStore(name);
    this.config = config ?? PRESETS[name] ?? PRESETS.default;
  }

  check(key: string): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now - entry.windowStart >= this.config.windowMs) {
      // New window
      this.store.set(key, { count: 1, windowStart: now });
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetAfterMs: this.config.windowMs,
      };
    }

    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAfterMs: this.config.windowMs - (now - entry.windowStart),
      };
    }

    entry.count += 1;
    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetAfterMs: this.config.windowMs - (now - entry.windowStart),
    };
  }

  /** Manually reset the counter for a key (e.g., after successful login) */
  reset(key: string): void {
    this.store.delete(key);
  }
}

// Singleton instances per preset
const limiterCache = new Map<string, RateLimiter>();

export function getRateLimiter(preset: keyof typeof PRESETS | string): RateLimiter {
  if (!limiterCache.has(preset)) {
    limiterCache.set(preset, new RateLimiter(preset));
  }
  return limiterCache.get(preset)!;
}

/**
 * Extract the real client IP from a Next.js request.
 * Respects x-forwarded-for (Vercel/reverse proxies).
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headers.get('x-real-ip') ?? 'unknown';
}
