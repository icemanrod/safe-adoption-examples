# opaque-vendor-blob

**Synthetic example.** The case where the honest answer is *we cannot tell from
out here.*

## Why this one matters most

The readable source is 22 lines and there is nothing wrong with it. A review
that reported only on what it read would file **zero findings** — and a reader
would take zero findings to mean "clean".

It does not mean clean. It means the interesting material was never obtained:

| What | Status |
|---|---|
| `vendor/engine` (compiled binary) | never read — not source |
| `vendor/engine-src` (submodule) | never fetched — host does not resolve |
| build pipeline that produced the binary | not in this repository |
| whether the binary matches the submodule | **unanswerable from here** |

Every real behaviour of this package is inside `transform()`, which lives in the
blob.

## Findings: 0 · Omissions: 4

That ratio is the whole point of the example. A packet that reports findings but
not omissions turns *"we did not look there"* into *"there is nothing there"*.

The verdict is HOLD, and the reason is not a defect — it is a **coverage
boundary**. No amount of further static reading closes it, because the material
is not present to read.

## Decision packet

- [`ADOPTION-DECISION.md`](ADOPTION-DECISION.md)
- [`adoption-decision.json`](adoption-decision.json)
