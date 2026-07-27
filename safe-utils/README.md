# safe-utils

A utility library that passed adoption review. Example of a clean adoption decision.

## What passed

1. **No credential handling** — pure utility functions
2. **All dependencies pinned** — exact version constraints, no ranges
3. **Clear API surface** — well-documented error paths
4. **No feature flags** — no undocumented env vars or hidden modes

## Decision packet

See `ADOPTION-DECISION.md` for the sealed manifest, findings (none blocking), verdict (ACCEPT), and conditions.

## Structure

```
src/
  parsing.ts
  validation.ts
  formatting.ts
tests/
  parsing.test.ts
  validation.test.ts
  formatting.test.ts
package.json
README.md
ADOPTION-DECISION.md
```
