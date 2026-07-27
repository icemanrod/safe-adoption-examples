/**
 * SYNTHETIC EXAMPLE. The "we cannot tell from here" case.
 *
 * The readable surface is small and unremarkable. That is the trap: a reviewer
 * who only reports on what they read would file zero findings and imply the
 * package is fine. Most of what this package DOES lives in material that was
 * never obtained - see ../ADOPTION-DECISION.md, Omissions.
 */

import { transform } from "../vendor/engine";

export type Options = { locale?: string; strict?: boolean };

export function process(input: string, options: Options = {}): string {
  if (typeof input !== "string") throw new TypeError("input must be a string");
  return transform(input, options.locale ?? "en", options.strict ?? false);
}

export function version(): string {
  return "2.0.1";
}
