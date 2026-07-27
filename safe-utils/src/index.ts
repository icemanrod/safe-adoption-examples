/**
 * safe-utils - the passing example.
 *
 * NOTE FOR READERS OF THE ADOPTION EXAMPLE:
 * There is nothing clever here, and that is the point. No credential handling,
 * no network, no environment reads, no dynamic dispatch. The ACCEPT in
 * ../ADOPTION-DECISION.md is defensible precisely because the surface is small
 * enough to read end to end.
 */

export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError(`chunk size must be a positive integer, got ${size}`);
  }
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export function uniqueBy<T, K>(items: readonly T[], key: (item: T) => K): T[] {
  const seen = new Set<K>();
  const out: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

export function clamp(value: number, min: number, max: number): number {
  if (min > max) throw new RangeError(`min ${min} exceeds max ${max}`);
  return Math.min(Math.max(value, min), max);
}

/** Returns null rather than throwing - callers decide what a bad parse means. */
export function parseJson<T = unknown>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
