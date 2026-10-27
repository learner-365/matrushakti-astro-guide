type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

export function allowRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const previous = buckets.get(key);
  if (!previous || previous.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (previous.count >= limit) return false;
  previous.count += 1;
  return true;
}

export function requestKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${scope}:${forwarded || "unknown"}`;
}

