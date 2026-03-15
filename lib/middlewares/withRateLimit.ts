import { NextRequest } from "next/server";
import { AppError } from "@/lib/utils/errors";

/**
 * Simple in-memory rate limit (per identifier, e.g. IP or userId).
 * For production, use Redis or similar; this is a placeholder that can be swapped.
 */
const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

function getIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  return ip;
}

/**
 * Rate limits by request identifier (IP). Throws AppError (429) when limit exceeded.
 * Call at the start of a route if needed.
 */
export function withRateLimit(
  req: NextRequest,
  options: { windowMs?: number; max?: number } = {}
): void {
  const windowMs = options.windowMs ?? WINDOW_MS;
  const max = options.max ?? MAX_REQUESTS;
  const key = getIdentifier(req);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  entry.count += 1;
  if (entry.count > max) {
    throw new AppError("Too many requests. Please try again later.", 429);
  }
}
