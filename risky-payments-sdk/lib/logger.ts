/** Minimal logger stand-in for the example. */
type Fields = Record<string, unknown> | undefined;

function emit(level: string, message: string, fields: Fields) {
  const line = { level, message, ...(fields ?? {}), at: new Date().toISOString() };
  process.stdout.write(JSON.stringify(line) + "\n");
}

export const logger = {
  debug: (m: string, f?: Fields) => emit("debug", m, f),
  info: (m: string, f?: Fields) => emit("info", m, f),
  warn: (m: string, f?: Fields) => emit("warn", m, f),
  error: (m: string, f?: Fields) => emit("error", m, f),
};
