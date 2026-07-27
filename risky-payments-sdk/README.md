# risky-payments-sdk

A payment SDK with known adopter-visible risks. Used as an example of what adoption review finds.

## What's risky

1. **Webhook logging vulnerability** (apps/webhooks/handler.ts:320)
   - Full Stripe webhook payload logged before signature validation
   - Log retention policy undocumented
   - Adopters can see this in code; only maintainer can confirm log TTL

2. **Partial submodule fetch** (config/submodules)
   - Payment processor SDK fetched; test fixtures not fetched
   - Adoption boundary incomplete — not a finding, but recorded

3. **Undocumented test mode** (lib/env.ts)
   - `PAYMENT_SDK_TEST_MODE=1` disables rate limiting
   - Not documented in README; could accidentally enable in prod if env var leaks

## Decision packet

See `ADOPTION-DECISION.md` for the full sealed manifest, findings, verdict, and authorization template.

## Structure

```
apps/
  webhooks/
    handler.ts    ← logging issue at :320
config/
  submodules     ← partial fetch
lib/
  env.ts         ← undocumented test flag
README.md
ADOPTION-DECISION.md
```
