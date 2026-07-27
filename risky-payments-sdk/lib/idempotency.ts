/** In-memory idempotency store. A real SDK would persist this. */
const seen = new Map<string, number>();

export async function hasSeenEvent(id: string): Promise<boolean> {
  return seen.has(id);
}

export async function recordEvent(id: string, type: string, created: number): Promise<void> {
  seen.set(id, created);
  void type;
}
