/**
 * Rate Limiting Utility
 * 
 * Provides rate limiting for API routes to prevent abuse and DoS attacks.
 * Uses Upstash Redis for distributed rate limiting (works across multiple instances).
 * 
 * Falls back to in-memory rate limiting if Upstash is not configured.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash Redis is configured
const hasUpstashConfig = 
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis client if configured
const redis = hasUpstashConfig
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// In-memory rate limiter fallback (simple implementation)
class InMemoryRateLimiter {
  private store: Map<string, { count: number; resetAt: number }> = new Map();

  async limit(
    identifier: string,
    limit: number,
    window: number
  ): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now();
    const key = identifier;
    const record = this.store.get(key);

    if (!record || now > record.resetAt) {
      // Reset or create new record
      this.store.set(key, {
        count: 1,
        resetAt: now + window * 1000,
      });
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + window * 1000,
      };
    }

    if (record.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: record.resetAt,
      };
    }

    record.count++;
    return {
      success: true,
      limit,
      remaining: limit - record.count,
      reset: record.resetAt,
    };
  }
}

const inMemoryLimiter = new InMemoryRateLimiter();

/**
 * Create a rate limiter instance
 * 
 * @param limit - Maximum number of requests
 * @param window - Time window in seconds
 * @param identifier - Optional identifier prefix (default: "global")
 */
export function createRateLimiter(
  limit: number,
  window: number,
  identifier: string = "global"
) {
  if (redis) {
    // Use Upstash Redis for distributed rate limiting
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${window} s`),
      analytics: true,
      prefix: `@upstash/ratelimit/${identifier}`,
    });
  }

  // Fallback to in-memory rate limiting
  return {
    limit: async (key: string) => {
      return inMemoryLimiter.limit(`${identifier}:${key}`, limit, window);
    },
  };
}

/**
 * Common rate limiters for different use cases
 */
export const rateLimiters = {
  // Strict rate limiting for authentication endpoints
  auth: createRateLimiter(5, 60, "auth"), // 5 requests per minute

  // Moderate rate limiting for exam generation (expensive operation)
  examGeneration: createRateLimiter(10, 60, "exam-gen"), // 10 requests per minute

  // Standard rate limiting for API endpoints
  api: createRateLimiter(100, 60, "api"), // 100 requests per minute

  // Lenient rate limiting for general endpoints
  general: createRateLimiter(200, 60, "general"), // 200 requests per minute
};

/**
 * Rate limit middleware helper
 * 
 * Usage in API routes:
 * ```typescript
 * const rateLimitResult = await rateLimiters.api.limit(userId || ip);
 * if (!rateLimitResult.success) {
 *   return NextResponse.json(
 *     { error: "Too many requests", retryAfter: rateLimitResult.reset },
 *     { status: 429 }
 *   );
 * }
 * ```
 */
export async function rateLimit(
  limiter: ReturnType<typeof createRateLimiter>,
  identifier: string
) {
  const result = await limiter.limit(identifier);
  
  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
  }
  
  return result;
}

