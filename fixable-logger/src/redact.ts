/**
 * Field redaction for structured logs.
 *
 * SYNTHETIC EXAMPLE. This is the REMEDIATE case: the design is sound, the
 * intent is clear, and there is one concrete defect that a named change fixes.
 * That is what separates REMEDIATE from HOLD - nothing here needs an answer
 * from the maintainer, it needs a patch.
 */

const REDACTED = "[redacted]";

const SENSITIVE_KEYS = [
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "api_key",
];

function isSensitive(key: string): boolean {
  return SENSITIVE_KEYS.includes(key.toLowerCase());
}

/**
 * Redact sensitive fields from a log record.
 *
 * The defect: this walks only the TOP level. A sensitive value nested inside an
 * object or an array is written verbatim, and structured loggers nest by
 * default - `{ user: { token } }` is the ordinary shape, not an edge case.
 */
export function redact(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    out[key] = isSensitive(key) ? REDACTED : value;
  }
  return out;
}

export function redactString(text: string): string {
  return text.replace(/(bearer\s+)[A-Za-z0-9._-]+/gi, `$1${REDACTED}`);
}
