/**
 * Runtime configuration.
 *
 * NOTE FOR READERS OF THE ADOPTION EXAMPLE:
 * `PAYMENT_SDK_TEST_MODE` is the undocumented flag recorded in
 * ../ADOPTION-DECISION.md. It is deliberately absent from the README, which is
 * the point of the finding: an adopter reading the docs would not know it
 * exists, and it changes production behaviour.
 */

function bool(name: string, fallback = false): boolean {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return raw === "1" || raw.toLowerCase() === "true";
}

function required(name: string): string {
  const raw = process.env[name];
  if (!raw) throw new Error(`missing required environment variable: ${name}`);
  return raw;
}

export const config = {
  webhookSecret: required("PAYMENT_SDK_WEBHOOK_SECRET"),
  apiBase: process.env.PAYMENT_SDK_API_BASE ?? "https://api.example-processor.test",
  requestTimeoutMs: Number(process.env.PAYMENT_SDK_TIMEOUT_MS ?? 10_000),

  // Undocumented. Disables rate limiting when set. Not mentioned in README.
  testMode: bool("PAYMENT_SDK_TEST_MODE"),

  logLevel: process.env.PAYMENT_SDK_LOG_LEVEL ?? "info",
};
