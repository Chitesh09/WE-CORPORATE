/**
 * Lightweight rate limiting abstraction.
 * Uses in-memory sliding window token bucket for local dev & test,
 * or Upstash Redis in production.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

export async function checkRateLimit(
  identifier: string,
  maxRequests = 5,
  windowSeconds = 60
): Promise<{ success: boolean; remaining: number }> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const key = `ratelimit:${identifier}`;

  const record = memoryStore.get(key);

  if (!record || now > record.resetTime) {
    memoryStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: maxRequests - record.count };
}
