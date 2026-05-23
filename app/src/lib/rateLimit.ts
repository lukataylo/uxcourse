/**
 * In-memory rate limit. MVP only — resets on process restart and is per-
 * instance (don't deploy multi-replica with this). Good enough for the resend
 * email button.
 */

const lastHitAt = new Map<string, number>();

export function checkRateLimit(
  key: string,
  windowMs: number,
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = Date.now();
  const prev = lastHitAt.get(key);
  if (prev !== undefined && now - prev < windowMs) {
    return { allowed: false, retryAfterMs: windowMs - (now - prev) };
  }
  lastHitAt.set(key, now);
  return { allowed: true };
}
