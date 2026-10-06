import Stripe from "stripe";

/**
 * Server-only Stripe client. Do not import this module from client components.
 * The SDK pins API version 2026-09-30.endive.
 */

export class StripeConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StripeConfigError";
  }
}

function required(name: string, value: string | undefined, expectation: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    throw new StripeConfigError(`Missing ${name}. ${expectation}`);
  }
  return trimmed;
}

export function getStripeSecretKey(): string {
  const key = required(
    "STRIPE_SECRET_KEY",
    process.env.STRIPE_SECRET_KEY,
    "Set it to your Stripe secret key (sk_live_... or sk_test_...). A restricted key (rk_live_... or rk_test_...) is also accepted.",
  );
  if (!/^(sk|rk)_(live|test)_/.test(key)) {
    throw new StripeConfigError(
      "STRIPE_SECRET_KEY must be a Stripe secret key (sk_live_... or sk_test_...) or a restricted key (rk_live_... or rk_test_...).",
    );
  }
  return key;
}

export function getStripePublishableKey(): string {
  const canonical = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  const legacy = process.env.STRIPE_PUBLISHABLE_KEY?.trim();
  const key = required(
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    canonical || legacy,
    "Set it to your Stripe publishable key (pk_live_... or pk_test_...).",
  );
  if (!/^pk_(live|test)_/.test(key)) {
    throw new StripeConfigError(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be a Stripe publishable key (pk_live_... or pk_test_...).",
    );
  }
  return key;
}

export function getStripeProPriceId(): string {
  const priceId = required(
    "STRIPE_PRO_PRICE_ID",
    process.env.STRIPE_PRO_PRICE_ID,
    "Set it to the one-time or recurring Price ID for Lifetime Pro (price_...).",
  );
  if (!/^price_/.test(priceId)) {
    throw new StripeConfigError("STRIPE_PRO_PRICE_ID must be a Stripe Price ID (price_...).");
  }
  return priceId;
}

export function getStripeWebhookSecret(): string {
  const secret = required(
    "STRIPE_WEBHOOK_SECRET",
    process.env.STRIPE_WEBHOOK_SECRET,
    "Set it to the signing secret for the /api/stripe/webhook endpoint (whsec_...).",
  );
  if (!/^whsec_/.test(secret)) {
    throw new StripeConfigError(
      "STRIPE_WEBHOOK_SECRET must be a Stripe webhook signing secret (whsec_...).",
    );
  }
  return secret;
}

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey());
  }
  return stripeClient;
}
