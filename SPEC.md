# The adoption decision packet, v1

A packet is one answer to one question: **should this specific revision of this
specific repository be brought inside, for this specific use?**

It is not a certification, not a score, and not a security audit. It is a
recommendation with its evidence attached, its gaps stated, and an expiry.

Schema: [`schema/adoption-decision.v1.json`](schema/adoption-decision.v1.json)
Validate: `python3 tools/validate_packets.py`

---

## The four ideas the format exists to carry

### 1. A decision is about a revision, not a project

`source.resolved_commit` is required. "We reviewed acme/widget" is not a
decision — the project moves, and the review does not move with it. A re-review
at a new commit is a new engagement, and the format is built to make that
obvious rather than to hide it.

`requested_ref` is kept separate on purpose. A tag can be moved; a commit
cannot. Recording both shows what was asked for *and* what it actually resolved
to.

### 2. A decision is about a use, not a piece of code

`intended_use` is required. The same library is a different question as a
build-time formatter than as something handling production card data. A verdict
without a stated use is unbounded, and an unbounded verdict quietly becomes a
certification.

### 3. Findings and omissions are different claims

This is the distinction most review formats lose, and it is the one that matters
most.

| | claim | if absent |
|---|---|---|
| **finding** | we read this material and observed X | evidence must be openable |
| **omission** | we never obtained this material | nothing is claimed about it |

A packet that reports findings but not omissions turns *"we did not look there"*
into *"there is nothing there."* `acquisition.omissions` is required, and may be
empty — but it must be present, so its emptiness is a statement rather than an
oversight.

`opaque-vendor-blob/` exists in this repository to show the extreme case: **zero
findings, four omissions, verdict HOLD.** Nothing observed was wrong. Almost
nothing was observable.

### 4. Authorization is a human act

`authorization.authorized_by` is required and must be `null` in a published
packet. `tools/validate_packets.py` rejects a packet where a reviewer filled it
in.

A reviewer produces evidence and a recommendation. Somebody who will carry the
consequences accepts the risk, by name. No amount of machine evidence performs
that step, and a format that let a reviewer forge it would be back to selling a
badge.

---

## Verdicts

| Verdict | Means | Distinguishing question |
|---|---|---|
| **BLOCK** | Should not be adopted at this revision for this use | Would any answer from the maintainer change it? If no → BLOCK |
| **HOLD** | An open question must be answered first | Can somebody answer it? If yes → HOLD |
| **REMEDIATE** | A real defect, fixable by a named change | Is the fix known and bounded? If yes → REMEDIATE |
| **ACCEPT** | No adopter-visible blocking issues in the material read | — |

Two rules keep these honest:

**BLOCK carries no `conditions_for_accept`.** If conditions would close it, it
was HOLD or REMEDIATE. `hostile-installer/` states this directly: the capability
is the problem, not its configuration.

**REMEDIATE requires `named_fix` on the finding.** Without the name, REMEDIATE
is just HOLD with a friendlier word. The validator enforces it.

### `basis`: findings vs coverage boundary

A HOLD can arise two ways, and they are materially different to a reader:

- `basis: "findings"` — something was observed that needs resolving
- `basis: "coverage_boundary"` — nothing observed was wrong; the material could
  not be assessed from outside

Conflating them is how "we cannot tell" gets read as "we checked."

---

## Who can verify what

Every finding carries `adopter_can_verify`.

- **true** — the reader can confirm it from source. Cite path and line.
- **false** — only the maintainer can confirm it. The finding must then carry
  `owner_only_signals` explaining why, and it must not be reported as settled.

The validator enforces that a finding with `owner_only_signals` cannot also be
`adopter_can_verify: true`.

`reproduction_or_verification` must never instruct active testing — no "try the
credential", no "replay the webhook against staging". An adopter has no
authority over the target, and advice assuming otherwise turns a review into
unauthorized access. This is a boundary of the format, not a style preference.

---

## Expiry

`verdict.expires_when` is required and must be non-empty. A decision with no
expiry is a certification wearing a different hat.

The standard three:

```json
"expires_when": [
  "resolved_commit changes",
  "intended_use changes",
  "ruleset_sha256 changes"
]
```

The third is the one people forget. If the rules that produced the findings
change, the decision was made under a different standard and no longer describes
the current one.

---

## Minimal valid packet

```json
{
  "schema": "adoption-decision/v1",
  "source": { "repo": "https://github.com/example/thing", "resolved_commit": "9f8e7d6c5b4a3210" },
  "intended_use": { "component": "utility library", "environment": "production", "permissions": ["read"] },
  "manifest": { "scanner": "your-reviewer", "ruleset_sha256": "3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a", "coverage": "static · no execution" },
  "acquisition": { "complete": true, "omissions": [] },
  "findings": [],
  "verdict": {
    "recommendation": "ACCEPT",
    "not_a_certification": true,
    "expires_when": ["resolved_commit changes", "intended_use changes", "ruleset_sha256 changes"]
  },
  "authorization": { "authorized_by": null, "authorized_at": null }
}
```

---

## What v1 does not do

Stated plainly, because a format that hides its limits is doing the thing this
one argues against:

- **No signatures.** Nothing here is cryptographically bound to a reviewer.
  `manifest_sha256` detects drift; it does not prove authorship.
- **No severity scoring.** No CVSS, no numbers. A number invites comparison
  across packets that were scoped differently.
- **No machine-readable remediation.** `named_fix` is prose for a human.
- **No dynamic analysis vocabulary.** The format assumes static, read-only
  review. It has no way to express "we ran it in a sandbox and observed X."

v1 is small on purpose. Extending it is easier than retracting a claim it should
never have made.
