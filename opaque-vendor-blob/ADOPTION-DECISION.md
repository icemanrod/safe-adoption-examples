# ADOPTION DECISION — opaque-vendor-blob

**Repository**: github.com/example/opaque-vendor-blob
**Revision**: 2f3a4b5c6d7e8f90 (pinned)
**Intended use**: Text processing in a request path, production
**Decision date**: 2026-07-27
**Authorizer**: _[your name and title]_

---

## Sealed Manifest

```json
{
  "scanner": "repo-sentinel",
  "ruleset_sha": "sha256:3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a",
  "source_sha": "2f3a4b5c6d7e8f90",
  "coverage": "static · no execution · adopter-safe rendering",
  "coverage_complete": false,
  "manifest_sha": "sha256:8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b"
}
```

Note `coverage_complete: false`. The manifest records that the scan did not
cover the whole package — before any finding is read.

---

## Acquisition Evidence

| What | Status |
|------|--------|
| Repository cloned | ✓ |
| Revision fetched | ✓ 2f3a4b5c6d7e8f90 |
| `vendor/engine` (compiled) | ⚠ present in published package; **not source, not read** |
| `vendor/engine-src` (submodule) | ⚠ **never fetched** — host does not resolve publicly |
| Build pipeline | ⚠ **not in this repository** |
| Binary ↔ source correspondence | ⚠ **unanswerable from here** |

---

## Findings

**None.**

Read that with the omissions above, not on its own. Zero findings here means
*nothing objectionable was found in the material that was read*, and the
material that was read is 22 lines of argument-forwarding.

---

## Omissions

### 1. The compiled engine was never read
`vendor/engine` is a binary. Static source review does not apply to it. Every
behaviour this package actually performs is inside it.

### 2. The engine source was never fetched
`.gitmodules` declares `vendor/engine-src` against a host that does not resolve
publicly. It was not obtained, so it was not read.

### 3. The build is not in the repository
Nothing here describes how the binary was produced, by whom, or from which
revision.

### 4. Correspondence cannot be established
Even with the submodule, nothing available to an adopter proves the shipped
binary was built from that source. That requires a reproducible build or a
signature the maintainer publishes.

---

## Unresolvable Questions

1. **What does `transform()` do?** — only answerable by reading the engine
   source or executing the binary. This review does neither.
2. **Was the shipped binary built from the declared source?** — requires
   reproducible builds or maintainer-published provenance.
3. **Does the engine make network calls?** — not determinable from a binary
   without dynamic analysis, which is out of scope by design.

Each is recorded rather than guessed. A verdict that answered them anyway would
be inventing evidence.

---

## Verdict — **HOLD**

**Not a defect finding.** Nothing observed is wrong. This is a **coverage
boundary**: the package cannot be assessed for the stated use with the material
available.

**Why HOLD and not ACCEPT**: ACCEPT would mean no adopter-visible blocking
issues were found in the material read — technically true, and profoundly
misleading, because the material read is a thin wrapper around everything that
matters.

**Why HOLD and not BLOCK**: nothing here is hostile. Vendoring a compiled engine
is ordinary practice. The problem is not the code, it is what an outside reader
can establish about it.

**Conditions for ACCEPT** (any one closes it):
- maintainer publishes reproducible build instructions that reproduce the
  shipped binary bit-for-bit, or
- `vendor/engine-src` is made publicly fetchable at the revision the binary was
  built from, plus a signature binding the two, or
- the intended use narrows to a context where the engine's behaviour does not
  matter — sandboxed, no network, no untrusted input.

**Expires when**: revision, intended use, or ruleset moves.

---

## What to watch

This one is worth restating: **do not read "0 findings" as "clean".** If this
package is adopted under the third condition, the sandbox is the control, and
the moment the use widens, this decision no longer applies.
