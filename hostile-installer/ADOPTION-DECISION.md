# ADOPTION DECISION — hostile-installer

**Repository**: github.com/example/hostile-installer
**Revision**: c7d8e9f0a1b2c3d4 (pinned)
**Intended use**: Build-time dependency, developer machines and CI
**Decision date**: 2026-07-27
**Authorizer**: _[your name and title]_
**Authorization**: _[pending]_

---

## Sealed Manifest

```json
{
  "scanner": "repo-sentinel",
  "ruleset_sha": "sha256:3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a",
  "source_sha": "c7d8e9f0a1b2c3d4",
  "coverage": "static · no execution · adopter-safe rendering",
  "manifest_sha": "sha256:4c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d",
  "binding_constraints": "exact revision only; re-review at new commit"
}
```

Nothing in this package was executed to produce this decision. The behaviour
below was read from source.

---

## Acquisition Evidence

| What | Status |
|------|--------|
| Repository cloned | ✓ |
| Revision fetched | ✓ c7d8e9f0a1b2c3d4 |
| Submodules | ✓ none declared |
| LFS pointers | ✓ none |
| Symlinks out of tree | ✓ none |

**Boundary**: acquisition complete. No omissions.

---

## Findings

### 1. Remote response is executed as a shell command

**Path**: `scripts/postinstall.js:63`
**Severity**: BLOCK
**Adopter can verify**: Yes (read source)

```javascript
// Line 63
    execSync(bootstrap, { stdio: "ignore", shell: "/bin/sh" });
```

`bootstrap` is the response body from `https://cdn.example-analytics.invalid`.
Whoever controls that endpoint controls what executes on the installing machine,
at install time, as the installing user. The package declares this hook in
`package.json` under `scripts.postinstall`, so it runs on a plain `npm install`.

### 2. Host details are collected and posted before the fetch

**Path**: `scripts/postinstall.js:31`
**Severity**: BLOCK
**Adopter can verify**: Yes (read source)

Username, hostname, working directory, platform, architecture and Node version
are gathered and POSTed. The operator therefore knows who is installing before
choosing what to return to them — which makes targeted delivery trivial and
makes any single observation of "benign" traffic unreliable as evidence.

### 3. The path is suppressed under automation

**Path**: `scripts/postinstall.js:23`
**Severity**: BLOCK
**Adopter can verify**: Yes (read source)

`isAutomated()` returns true when `CI` or `GITHUB_ACTIONS` is set, or when
stdout is not a TTY, and the whole routine returns early. A maintainer running
the package in CI would never observe the behaviour. This is what elevates the
other two findings: the code is arranged so that the people most likely to look
are the people least likely to see it.

---

## Unresolvable Questions

None. Every finding above is legible in source and requires no confirmation from
the maintainer.

That absence is itself the argument. HOLD exists for the case where a person
could still answer the question. There is no question here.

---

## Verdict — **BLOCK**

**This is not a certification, and not an accusation.** It is a statement that
the code at this revision should not be brought inside for the stated use.

**What BLOCK means here**: no configuration, no sandbox flag, and no assurance
from the maintainer changes the finding, because the capability is the problem.
Arbitrary remote code execution at install time is not a risk to be accepted
with conditions — it is a property to be removed.

**What would change it**: a revision in which the postinstall hook no longer
executes fetched content. That would be a new engagement against a new commit,
not a re-reading of this one.

**Expires when**: this decision is bound to `c7d8e9f0a1b2c3d4`. It says nothing
about any other revision of this package.

---

## What to watch

Not applicable. Nothing is being adopted.

If this package is already installed somewhere, the relevant question is not
"should we adopt it" but "what ran, on which machines, and when" — a different
exercise, and an incident-response one.
