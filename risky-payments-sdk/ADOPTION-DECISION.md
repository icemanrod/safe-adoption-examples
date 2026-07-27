# ADOPTION DECISION — risky-payments-sdk

**Repository**: github.com/example/risky-payments-sdk  
**Revision**: a1b2c3d4e5f6g7h8 (pinned)  
**Intended use**: Billing webhooks, production  
**Decision date**: 2026-07-27  
**Authorizer**: _[your name and title]_  
**Authorization**: _[ACCEPT / HOLD / BLOCK]_

---

## Sealed Manifest

```json
{
  "scanner": "repo-sentinel",
  "ruleset_sha": "sha256:3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a",
  "source_sha": "a1b2c3d4e5f6g7h8",
  "acquired_at": "2026-07-27T18:04:12Z",
  "coverage": "static · no execution · adopter-safe rendering",
  "artifacts": ["findings"],
  "manifest_sha": "sha256:9f3c8b7a6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b",
  "binding_constraints": "exact revision only; re-review at new commit"
}
```

---

## Acquisition Evidence

| What | Status |
|------|--------|
| Repository cloned | ✓ |
| Revision fetched | ✓ a1b2c3d4e5f6g7h8 |
| Submodules | ⚠ `test-fixtures` never fetched (declared in `config/submodules`, which WAS read) |
| LFS pointers | ✓ None |
| Symlinks out of tree | ✓ None |

**Boundary**: acquisition is complete except for one submodule. The manifest
`config/submodules` was read and is present; the path it declares,
`test-fixtures`, was never fetched. That distinction is the point — the omission
is the unfetched material, not the file that documents it.

Recorded as an omission, not a finding. Nothing was read there, so nothing is
claimed about it.

---

## Findings

### 1. Webhook handler logs full request before validation

**Path**: `apps/webhooks/handler.ts:320`  
**Severity**: HOLD  
**Adopter can verify**: Yes (read source)

```typescript
// Line 320
logger.info("Webhook received", request.body);  // ← logged before validation
// Line 322–327
const signature = request.headers["x-stripe-signature"] as string | undefined;
if (!verifySignature(signature, request.body, secret)) {
  return 401;
}
```

**Impact**: Webhook request bodies contain legitimate billing metadata (customer ID, amount, subscription status). An unauthenticated caller can POST arbitrary JSON to this endpoint and pollute logs with attacker-controlled content before signature check rejects it.

**Question for maintainer**: What is the log retention policy? If logs are rotated <24h and not shipped to external stores, this is low-risk adoption. If logs are archived or persisted, adopters need to know.

**Adopter action**: Ask maintainer for written confirmation of log TTL and external log destinations. HOLD until answered.

---

### 2. Undocumented test mode disables rate limiting

**Path**: `lib/env.ts`  
**Severity**: HOLD  
**Adopter can verify**: Yes (read source; cannot verify in production without env var access)

The environment variable `PAYMENT_SDK_TEST_MODE` is not documented in README but is checked in the webhook handler. When set to `1`, rate limiting is bypassed.

```javascript
// lib/env.ts line 45
if (process.env.PAYMENT_SDK_TEST_MODE === '1') {
  rateLimitDisabled = true;
}
```

**Impact**: If this env var is exposed (CI logs, bundled config, shared .env file), production webhook handling could bypass rate limits and accept duplicate charges.

**Adopter action**: Verify that `PAYMENT_SDK_TEST_MODE` is never set in your production environment. Do not bundle this SDK with any env files. If you fork it, remove the test mode check entirely rather than rely on env var discipline.

---

## Omissions (Intentional)

- **Maintainer intent**: We did not contact the maintainer to confirm or dispute intent. These are observable code behaviors, not judgments.
- **Execution testing**: We did not run this code, replay requests, or test with credentials.
- **Dependency audit**: We did not audit transitive dependencies (covered by your dep scanning, not adoption review scope).

---

## Verdict

**HOLD** — Material open questions. Do not adopt at this revision for production until conditions clear.

### Conditions for ACCEPT
1. Maintainer confirms log retention policy is <24h AND logs are not shipped to external stores, OR logs are encrypted and access-controlled
2. Maintainer documents the `PAYMENT_SDK_TEST_MODE` env var in README and commits to removing it in a major version bump

### If maintainer doesn't respond
Adopt only with a wrapper that:
- Strips the request body from logs before logging
- Removes or ignores the `PAYMENT_SDK_TEST_MODE` check entirely

---

## Post-Adoption Monitoring

If you proceed with conditions above:
- Monitor your logs for webhook request bodies (should never appear)
- Audit your deployment for any `PAYMENT_SDK_TEST_MODE` references
- Re-review if maintainer merges the main branch forward without addressing these

---

## Authorization

**This decision is binding for this revision only.**  
A commit bump, scope change, or new findings require re-review.

| Field | Value |
|-------|-------|
| Authorized by | _[your name]_ |
| Title | _[your title]_ |
| Date | _[date]_ |
| Signature | _[your approval]_ |

---

**Not a certification. Not legal advice. Authorization stays with you.**
