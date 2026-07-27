# hostile-installer

**Synthetic. Deliberately hostile. Do not run any of it.**

The BLOCK example. A package whose `postinstall` hook sends machine details to a
remote endpoint and then executes whatever that endpoint returns.

## What is wrong with it

1. **Remote content reaches a shell** — `scripts/postinstall.js:63`
   The response body from an external endpoint is passed straight to
   `execSync`. Whoever controls that endpoint controls what runs on the
   installing machine, at install time, with the installing user's privileges.

2. **Host details are exfiltrated first** — `scripts/postinstall.js:31`
   Username, hostname, working directory and platform are collected and posted
   before anything is fetched. The operator learns who is installing before
   deciding what to send them.

3. **It hides from CI** — `scripts/postinstall.js:23`
   `isAutomated()` suppresses the whole path when `CI` is set or stdout is not a
   TTY. A maintainer running tests in CI would never observe the behaviour. This
   is the detail that makes the other two worse: it is built to be missed.

## Why BLOCK and not HOLD

HOLD means *there is an open question that a person could answer.* There is no
question here. The behaviour is legible in the source, it is unambiguous, and no
answer from the maintainer makes arbitrary remote code execution at install time
acceptable for the stated use.

BLOCK is not a claim that the maintainer is malicious. It is a claim that the
code, as written at this revision, should not be brought inside.

## Decision packet

- [`ADOPTION-DECISION.md`](ADOPTION-DECISION.md) — for a human
- [`adoption-decision.json`](adoption-decision.json) — machine-readable
