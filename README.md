# Safe Adoption Examples

Five worked examples of a **decision packet** — the artifact produced when
somebody reviews a third-party repository before pulling it into their systems.

All four verdicts are represented, plus the case nobody wants to publish: the one
where the honest answer is *we cannot tell from out here.* Each ships the
evidence, the sealed manifest, and the questions that stayed open — so you can
see what a defensible adoption decision looks like, including where it stops
short.

[![verify](https://github.com/icemanrod/safe-adoption-examples/actions/workflows/verify.yml/badge.svg)](https://github.com/icemanrod/safe-adoption-examples/actions/workflows/verify.yml)

---

## Why this repository exists

A review that says *"looks fine"* is worth nothing six months later. You cannot
tell what was read, what was skipped, which revision it applied to, or whether it
still holds.

A decision packet answers those questions in a form that survives:

- **bound to one revision** — a re-review at a new commit is a new engagement
- **bound to one intended use** — "vendored utility" and "handles production
  card data" are different questions about the same code
- **separates findings from omissions** — a finding is something observed in
  material that was read; an omission is material that was never read, recorded
  so nobody mistakes *we saw nothing there* for *there is nothing there*
- **says who can verify what** — an adopter reading source, or only the
  maintainer; where only the maintainer can confirm, it stays unresolved rather
  than being guessed
- **expires** — when the revision, the scope, or the ruleset moves

## The examples

| Example | Verdict | Why it is here |
|---|---|---|
| [`hostile-installer/`](hostile-installer/) | **BLOCK** | Install hook executes remote content, and hides from CI |
| [`risky-payments-sdk/`](risky-payments-sdk/) | **HOLD** | Real defect whose blocking question only the maintainer can answer |
| [`opaque-vendor-blob/`](opaque-vendor-blob/) | **HOLD** | 0 findings, 4 omissions — the "we cannot tell from here" case |
| [`fixable-logger/`](fixable-logger/) | **REMEDIATE** | One bounded defect with a named fix |
| [`safe-utils/`](safe-utils/) | **ACCEPT** | Small enough to read end to end |

The format is specified in [SPEC.md](SPEC.md) and enforced by
[`schema/adoption-decision.v1.json`](schema/adoption-decision.v1.json).

### The two worth reading first

**[`hostile-installer/`](hostile-installer/) — BLOCK.** A `postinstall` hook that
posts your hostname and username to a remote endpoint, then executes whatever
comes back. It also returns early when `CI` is set, so the people most likely to
look are the least likely to see it. BLOCK carries **no conditions for accept**:
the capability is the problem, not its configuration, and no assurance from the
maintainer changes that.

**[`opaque-vendor-blob/`](opaque-vendor-blob/) — HOLD, with zero findings.** The
readable source is 22 lines and there is nothing wrong with any of it. All the
behaviour lives in a compiled blob that was never read, behind a submodule that
never resolved. A review reporting only what it read would file zero findings and
imply "clean". This packet records **4 omissions** and holds — because *we did
not look there* and *there is nothing there* are different sentences.

## What is in each example

```
example/
├── README.md                 what it is, and what is deliberately wrong with it
├── ADOPTION-DECISION.md      the packet, for a human
├── adoption-decision.json    the same decision, machine-readable
└── source files              real code that the findings actually cite
```

## The citations are checkable, and checked

Every path a packet cites exists in the tree, at the line it claims:

```bash
python3 tools/verify_citations.py   # citations resolve to real source
python3 tools/validate_packets.py   # packets conform to the v1 schema
```

No dependencies, read-only, and both run in CI on every push.

The validator also enforces three rules the schema cannot express: a finding
that needs the maintainer cannot also be marked verifiable by the reader, a
REMEDIATE finding must name its fix, and **`authorization.authorized_by` must be
null** — a reviewer who fills it in has forged the one field they cannot
perform.

This matters more than it sounds. The first version of these examples cited three
files that **were not in the repository at all** — `apps/webhooks/handler.ts`,
`lib/env.ts`, `config/submodules`. The prose read perfectly and the evidence
resolved to nothing. That is the exact failure this whole approach argues
against, and it happened here first. The verifier exists so it cannot happen
again quietly.

It checks that evidence is *reachable*. It deliberately does **not** check
whether a finding is *correct* — that is a human judgement, and a script that
appeared to make it would be the same mistake in a new costume.

## Using the format yourself

The packets are MIT-licensed. Copy `adoption-decision.json` as a starting point.
The fields that carry the weight:

| Field | Why it matters |
|---|---|
| `source.resolved_commit` | the decision is about this revision and no other |
| `intended_use` | the same code is a different question in a different role |
| `manifest.ruleset_sha256` | which rules produced this, so drift is detectable |
| `acquisition.omissions` | what was never read, stated plainly |
| `findings[].adopter_can_verify` | whether the reader can confirm it themselves |
| `unresolvable[]` | open questions, kept open |
| `verdict.expires_when` | the conditions that void the decision |
| `authorization.authorized_by` | `null` here on purpose — a file cannot authorize |

That last one is the point of the whole format. The packet is a recommendation.
The authorization is a human act, performed by a named person who accepts the
risk, and no amount of machine evidence performs it for them.

## These examples are synthetic

`risky-payments-sdk` is not a fork of any real project. The processor is
fictional, the flaws are deliberate, and no credential in this tree is live.
Nothing here should be reported as a vulnerability in a third party. See
[SECURITY.md](SECURITY.md).

## Getting a review

- **Fit check first** — email [hello@icemanrod.com](mailto:hello@icemanrod.com)
  with the repository URL and what you intend to use it for. No access required.
- **Ready to go** — [repo-sentinel-olive.vercel.app](https://repo-sentinel-olive.vercel.app)

## Contributing

Corrections are genuinely wanted — especially a packet that claims something the
evidence does not support. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE). Use the format freely.
