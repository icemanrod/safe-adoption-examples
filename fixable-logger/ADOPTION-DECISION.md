# ADOPTION DECISION — fixable-logger

**Repository**: github.com/example/fixable-logger
**Revision**: 5e6f7a8b9c0d1e2f (pinned)
**Intended use**: Application logging, production services
**Decision date**: 2026-07-27
**Authorizer**: _[your name and title]_

---

## Sealed Manifest

```json
{
  "scanner": "repo-sentinel",
  "ruleset_sha": "sha256:3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a",
  "source_sha": "5e6f7a8b9c0d1e2f",
  "coverage": "static · no execution · adopter-safe rendering",
  "manifest_sha": "sha256:7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c"
}
```

---

## Acquisition Evidence

| What | Status |
|------|--------|
| Repository cloned | ✓ |
| Revision fetched | ✓ 5e6f7a8b9c0d1e2f |
| Submodules | ✓ none declared |
| LFS pointers | ✓ none |
| Symlinks out of tree | ✓ none |

**Boundary**: acquisition complete. No omissions.

---

## Findings

### 1. Redaction does not descend into nested values

**Path**: `src/redact.ts:35`
**Severity**: REMEDIATE
**Adopter can verify**: Yes (read source)

```typescript
// Line 35
    out[key] = isSensitive(key) ? REDACTED : value;
```

The key is checked; the value is assigned through unexamined. A sensitive field
nested one level down is written to the log verbatim. Structured logging nests
by default, so `{ user: { token } }` is the common case rather than an
unusual one.

**Named fix**: recurse into plain objects and arrays before assigning, and treat
a nested match the same as a top-level one. Roughly six lines in the same
function. No API change, no dependency change, no behavioural change for records
that are already flat.

---

## Unresolvable Questions

None. The behaviour is fully determined by the source read.

---

## Verdict — **REMEDIATE**

**Not a certification.** REMEDIATE means the defect is real, it is fixable by
the adopter or the maintainer, and the fix is named above.

**Why not HOLD**: HOLD is for a question only somebody else can answer. Nothing
here is unanswered.

**Why not BLOCK**: the library does what it claims for flat records, the design
is coherent, and one bounded change makes it correct. BLOCK would overstate it.

**Conditions for ACCEPT**: the redaction walk descends into nested objects and
arrays, with a test covering `{ user: { token } }`.

**Expires when**: revision, intended use, or ruleset moves.

---

## What to watch

After the fix lands: whether new sensitive key names get added to
`SENSITIVE_KEYS` as the application grows. The list is allow-list shaped, so it
silently fails open for any key nobody thought of — which is a design property
to accept knowingly, not a defect at this revision.
