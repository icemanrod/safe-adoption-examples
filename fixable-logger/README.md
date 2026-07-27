# fixable-logger

**Synthetic example.** The REMEDIATE case.

A structured logging library that redacts sensitive fields — correctly, but only
at the top level of a record.

## What is wrong with it

**Redaction does not recurse** — `src/redact.ts:35`

`redact()` iterates `Object.entries(record)` and checks each key, then assigns
the value through untouched. A sensitive value one level down is written
verbatim:

```ts
redact({ token: "abc" })            // { token: "[redacted]" }     correct
redact({ user: { token: "abc" } })  // { user: { token: "abc" } }  NOT redacted
```

Structured loggers nest by default, so this is the ordinary shape rather than an
edge case.

## Why REMEDIATE and not HOLD

HOLD is for an open question a person has to answer. There is no question here —
the behaviour is fully legible in fifteen lines, and the fix is a recursive walk.

REMEDIATE says: **the defect is real, it is yours to fix, and the fix is named.**
Adopt it after the patch, not after a conversation.

## Decision packet

- [`ADOPTION-DECISION.md`](ADOPTION-DECISION.md)
- [`adoption-decision.json`](adoption-decision.json)
