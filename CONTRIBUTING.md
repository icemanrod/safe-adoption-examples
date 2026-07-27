# Contributing

This repository is a set of worked examples, so the bar for a change is
slightly unusual: **an example is only useful if it is checkable.**

## The one rule

If a decision packet cites a path, that path must exist in the same example
directory, at the line it claims. `tools/verify_citations.py` enforces it and
runs in CI:

```bash
python3 tools/verify_citations.py
```

The first version of these examples cited three files that were not in the tree.
The prose read fine and the evidence resolved to nothing — which is precisely
the failure the product argues against. Please do not reintroduce it.

## Adding an example

An example is a directory containing:

| File | Purpose |
|---|---|
| `README.md` | what this repository is, and what is deliberately wrong with it |
| `ADOPTION-DECISION.md` | the packet: manifest, acquisition, findings, verdict |
| `adoption-decision.json` | the same decision, machine-readable |
| source files | real code that the findings actually cite |

Then run the verifier. If it passes, open a pull request.

## What a good finding looks like

- **Cites a real line.** Path and line number, not a description of where.
- **States who can verify it.** An adopter reading source, or only the
  maintainer. If only the maintainer can confirm it, say so and leave it
  unresolved rather than guessing.
- **Never instructs active testing.** No "try the credential", no "replay the
  webhook against staging". An adopter has no authority over the target, and
  advice that assumes otherwise turns a review into unauthorized access.
- **Separates findings from omissions.** A finding is something observed in
  material that was read. An omission is material never read. Recording the
  difference is the point.

## What does not belong here

- Real vulnerabilities in real third-party projects. These examples are
  synthetic on purpose.
- Anything copied from a paid engagement.
- Credentials, tokens, or customer names — including in example payloads.
