# Safe Adoption Examples

Two example repositories with Repo Sentinel decision packets.

One **fails** adoption review. One **passes**. Both show the evidence and sealed manifest so you can understand what a real adoption decision looks like.

## Examples

### 1. Failing case: `risky-payments-sdk/`
A real-world-inspired payment SDK with adopter-visible risks:
- Webhook handler logs full request body before signature validation
- Submodules partially fetched, leaving gaps in acquisition boundary
- Undocumented env var for test mode that affects production behavior

**Decision packet**: `risky-payments-sdk/ADOPTION-DECISION.md`
- Verdict: **HOLD** — material open questions until maintainer confirms log retention policy
- Conditions for ACCEPT: Written confirmation that logs are rotated <24h

### 2. Passing case: `safe-utils/`
A utility library that passed adoption review:
- No credential handling
- All dependencies pinned to exact versions
- Clear API surface, well-documented error paths
- No undocumented feature flags

**Decision packet**: `safe-utils/ADOPTION-DECISION.md`
- Verdict: **ACCEPT** — no blocking adopter-visible issues for vendoring as a utility
- Conditions: Re-review if major version bump or dependency changes

## How to use this

1. Read the failing case to understand what adoption review finds
2. Read the passing case to understand what clean looks like
3. Look at both decision packets to see the sealed manifest, findings, verdicts, and conditions
4. The structure is what Repo Sentinel delivers — you customize the findings and rules

## The decision packet format

Each packet includes:
- **Acquisition evidence**: what was actually obtained
- **Sealed manifest**: scanner identity, source revision, rule definitions (SHA-bound)
- **Findings**: adopter-safe, verified against source
- **Omissions**: gaps in coverage, boundaries, missing material (not papered over)
- **Verdict**: BLOCK / HOLD / REMEDIATE / ACCEPT with conditions
- **What to watch**: post-adoption monitoring

The binding to exact revision and scope means:
- A re-review at a new commit is a new engagement
- Adoption expires when the facts move
- Human authorization stays with a named person in your org

## Creating your own decision packet

Use the templates in each example. The key fields:
- `repo`: public URL, exact revision SHA
- `intended_use`: component, environment, permissions
- `sealed_manifest`: binds findings to exact scanner state
- `verdict`: your recommendation (not a cert)
- `binding`: human authorization name and date

## Questions?

- Before adoption? Email hello@icemanrod.com for a fit check
- Ready to buy a review? Visit repo-sentinel.com/pricing
