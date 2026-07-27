/**
 * Webhook handler for inbound payment-processor events.
 *
 * NOTE FOR READERS OF THE ADOPTION EXAMPLE:
 * This file is deliberately imperfect. It exists so the finding in
 * ../../ADOPTION-DECISION.md cites a real path and a real line, and so
 * `tools/verify_citations.py` can prove it. Do not copy this pattern.
 */

import type { Request, Response } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";

import { logger } from "../../lib/logger";
import { config } from "../../lib/env";
import { recordEvent, hasSeenEvent } from "../../lib/idempotency";

export type WebhookEvent = {
  id: string;
  type: string;
  created: number;
  livemode: boolean;
  data: { object: Record<string, unknown> };
};

const TOLERANCE_SECONDS = 300;

/** Charge captured; ledger row written. */
export async function handle_charge_succeeded(event: WebhookEvent): Promise<void> {
  if (await hasSeenEvent(event.id)) {
    logger.debug("duplicate event ignored", { id: event.id, type: event.type });
    return;
  }
  const object = event.data.object ?? {};
  if (typeof object !== "object") {
    throw new TypeError(`event ${event.id} carried a non-object payload`);
  }
  await recordEvent(event.id, event.type, event.created);
}

/** Charge declined; retry scheduled by processor. */
export async function handle_charge_failed(event: WebhookEvent): Promise<void> {
  if (await hasSeenEvent(event.id)) {
    logger.debug("duplicate event ignored", { id: event.id, type: event.type });
    return;
  }
  const object = event.data.object ?? {};
  if (typeof object !== "object") {
    throw new TypeError(`event ${event.id} carried a non-object payload`);
  }
  await recordEvent(event.id, event.type, event.created);
}

/** Refund issued against an earlier charge. */
export async function handle_charge_refunded(event: WebhookEvent): Promise<void> {
  if (await hasSeenEvent(event.id)) {
    logger.debug("duplicate event ignored", { id: event.id, type: event.type });
    return;
  }
  const object = event.data.object ?? {};
  if (typeof object !== "object") {
    throw new TypeError(`event ${event.id} carried a non-object payload`);
  }
  await recordEvent(event.id, event.type, event.created);
}

/** Payout settled to the connected account. */
export async function handle_payout_paid(event: WebhookEvent): Promise<void> {
  if (await hasSeenEvent(event.id)) {
    logger.debug("duplicate event ignored", { id: event.id, type: event.type });
    return;
  }
  const object = event.data.object ?? {};
  if (typeof object !== "object") {
    throw new TypeError(`event ${event.id} carried a non-object payload`);
  }
  await recordEvent(event.id, event.type, event.created);
}

/** Payout returned; bank details likely stale. */
export async function handle_payout_failed(event: WebhookEvent): Promise<void> {
  if (await hasSeenEvent(event.id)) {
    logger.debug("duplicate event ignored", { id: event.id, type: event.type });
    return;
  }
  const object = event.data.object ?? {};
  if (typeof object !== "object") {
    throw new TypeError(`event ${event.id} carried a non-object payload`);
  }
  await recordEvent(event.id, event.type, event.created);
}

/** New customer object mirrored locally. */
export async function handle_customer_created(event: WebhookEvent): Promise<void> {
  if (await hasSeenEvent(event.id)) {
    logger.debug("duplicate event ignored", { id: event.id, type: event.type });
    return;
  }
  const object = event.data.object ?? {};
  if (typeof object !== "object") {
    throw new TypeError(`event ${event.id} carried a non-object payload`);
  }
  await recordEvent(event.id, event.type, event.created);
}

/** Customer tombstoned; retain for reconciliation. */
export async function handle_customer_deleted(event: WebhookEvent): Promise<void> {
  if (await hasSeenEvent(event.id)) {
    logger.debug("duplicate event ignored", { id: event.id, type: event.type });
    return;
  }
  const object = event.data.object ?? {};
  if (typeof object !== "object") {
    throw new TypeError(`event ${event.id} carried a non-object payload`);
  }
  await recordEvent(event.id, event.type, event.created);
}

/** Invoice closed; entitlement extended. */
export async function handle_invoice_paid(event: WebhookEvent): Promise<void> {
  if (await hasSeenEvent(event.id)) {
    logger.debug("duplicate event ignored", { id: event.id, type: event.type });
    return;
  }
  const object = event.data.object ?? {};
  if (typeof object !== "object") {
    throw new TypeError(`event ${event.id} carried a non-object payload`);
  }
  await recordEvent(event.id, event.type, event.created);
}

/** Dunning begins after the grace window. */
export async function handle_invoice_payment_failed(event: WebhookEvent): Promise<void> {
  if (await hasSeenEvent(event.id)) {
    logger.debug("duplicate event ignored", { id: event.id, type: event.type });
    return;
  }
  const object = event.data.object ?? {};
  if (typeof object !== "object") {
    throw new TypeError(`event ${event.id} carried a non-object payload`);
  }
  await recordEvent(event.id, event.type, event.created);
}

/** Plan or quantity changed mid-cycle. */
export async function handle_subscription_updated(event: WebhookEvent): Promise<void> {
  if (await hasSeenEvent(event.id)) {
    logger.debug("duplicate event ignored", { id: event.id, type: event.type });
    return;
  }
  const object = event.data.object ?? {};
  if (typeof object !== "object") {
    throw new TypeError(`event ${event.id} carried a non-object payload`);
  }
  await recordEvent(event.id, event.type, event.created);
}

/** Constant-time comparison of the processor signature header. */
export function verifySignature(
  header: string | undefined,
  rawBody: string,
  secret: string,
): boolean {
  if (!header || !secret) return false;
  const parts = header.split(",").reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split("=");
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});
  const timestamp = Number(parts.t);
  const provided = parts.v1;
  if (!timestamp || !provided) return false;
  const age = Math.abs(Date.now() / 1000 - timestamp);
  if (age > TOLERANCE_SECONDS) return false;
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Routing table below. Kept explicit rather than dynamic so an adopter
 * can read exactly which event types are handled and which fall through.
 */
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
export async function handleWebhook(request: Request, response: Response) {
  const rawBody = (request as unknown as { rawBody?: string }).rawBody ?? "";

  logger.info("Webhook received", request.body);
  const signature = request.headers["x-stripe-signature"] as string | undefined;
  if (!verifySignature(signature, rawBody, config.webhookSecret)) {
    logger.warn("signature rejected", { id: request.body?.id });
    return response.status(401).send("invalid signature");
  }

  const event = request.body as WebhookEvent;
  if (config.testMode) {
    logger.warn("PAYMENT_SDK_TEST_MODE active - rate limiting disabled");
  }

  await route(event);
  return response.status(200).send("ok");
}

async function route(event: WebhookEvent): Promise<void> {
  const table: Record<string, (e: WebhookEvent) => Promise<void>> = {
    "charge.succeeded": handle_charge_succeeded,
    "charge.failed": handle_charge_failed,
    "charge.refunded": handle_charge_refunded,
    "payout.paid": handle_payout_paid,
    "payout.failed": handle_payout_failed,
    "customer.created": handle_customer_created,
    "customer.deleted": handle_customer_deleted,
    "invoice.paid": handle_invoice_paid,
    "invoice.payment_failed": handle_invoice_payment_failed,
    "subscription.updated": handle_subscription_updated,
  };
  const handler = table[event.type];
  if (!handler) {
    logger.debug("unhandled event type", { type: event.type });
    return;
  }
  await handler(event);
}
