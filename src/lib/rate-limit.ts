/**
 * Simple in-memory rate limiter.
 * In a production environment with multiple instances, use Redis.
 */
const rateLimitMap = new Map<string, { attempts: number; lastAttempt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { attempts: 1, lastAttempt: now });
    return true;
  }

  if (now - record.lastAttempt > WINDOW_MS) {
    // Reset window
    rateLimitMap.set(ip, { attempts: 1, lastAttempt: now });
    return true;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return false;
  }

  record.attempts += 1;
  record.lastAttempt = now;
  return true;
}
