import { getStripe, getStripeWebhookSecret, StripeConfigError } from "@/lib/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const USER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ENTITLED_STATUSES = new Set(["active", "trialing", "past_due"]);

function userIdFrom(...candidates: Array<string | null | undefined>): string | null {
  for (const candidate of candidates) {
    if (candidate && USER_ID.test(candidate)) return candidate;
  }
  return null;
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

async function writeBilling(
  userId: string,
  patch: {
    is_premium: boolean;
    stripe_customer_id?: string | null;
    stripe_subscription_id?: string | null;
  },
) {
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update(patch).eq("id", userId);
  if (error) {
    throw new Error(error.message);
  }
}

async function syncSubscription(
  subscription: Stripe.Subscription,
  fallbackUserId?: string | null,
  options?: { forceRevoke?: boolean },
) {
  const userId = userIdFrom(subscription.metadata?.user_id, fallbackUserId);
  if (!userId) {
    console.error("Stripe subscription is missing user_id metadata", subscription.id);
    return;
  }

  const entitled = !options?.forceRevoke && ENTITLED_STATUSES.has(subscription.status);
  await writeBilling(userId, {
    is_premium: entitled,
    stripe_customer_id: idOf(subscription.customer),
    stripe_subscription_id: subscription.status === "canceled" ? null : subscription.id,
  });
}

async function grantLifetimePro(session: Stripe.Checkout.Session) {
  const userId = userIdFrom(session.metadata?.user_id, session.client_reference_id);
  if (!userId) {
    console.error("Stripe checkout session is missing user_id", session.id);
    return;
  }

  const settled =
    session.payment_status === "paid" || session.payment_status === "no_payment_required";
  if (!settled) return;

  await writeBilling(userId, {
    is_premium: true,
    stripe_customer_id: idOf(session.customer),
    stripe_subscription_id: null,
  });
}

async function syncCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.mode === "payment") {
    await grantLifetimePro(session);
    return;
  }

  if (session.mode !== "subscription") return;

  const subscriptionId = idOf(session.subscription);
  if (!subscriptionId) return;

  const settled =
    session.payment_status === "paid" || session.payment_status === "no_payment_required";
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  await syncSubscription(subscription, session.metadata?.user_id ?? session.client_reference_id, {
    forceRevoke: !settled,
  });
}

async function revokeCustomer(customer: Stripe.Customer) {
  const userId = userIdFrom(customer.metadata?.user_id);
  const admin = createAdminClient();

  // Lifetime one-time purchases have no subscription id. Do not revoke those.
  const lookup = userId
    ? admin
        .from("profiles")
        .select("id, stripe_subscription_id")
        .eq("id", userId)
        .maybeSingle()
    : admin
        .from("profiles")
        .select("id, stripe_subscription_id")
        .eq("stripe_customer_id", customer.id)
        .maybeSingle();

  const { data: profile, error: lookupError } = await lookup;
  if (lookupError) throw new Error(lookupError.message);
  if (!profile?.stripe_subscription_id) return;

  const patch = {
    is_premium: false,
    stripe_customer_id: null,
    stripe_subscription_id: null,
  };

  const { error } = await admin.from("profiles").update(patch).eq("id", profile.id);
  if (error) throw new Error(error.message);
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await syncCheckoutSession(event.data.object);
      return;
    case "checkout.session.async_payment_failed":
      // One-time lifetime checkouts that never settle stay free; recurring
      // checkout still syncs so a failed async payment does not leave Pro on.
      if (event.data.object.mode === "subscription") {
        await syncCheckoutSession(event.data.object);
      }
      return;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      await syncSubscription(event.data.object);
      return;
    case "customer.deleted":
      await revokeCustomer(event.data.object);
      return;
    default:
      return;
  }
}

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, getStripeWebhookSecret());
  } catch (err) {
    if (err instanceof StripeConfigError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Invalid Stripe webhook signature." }, { status: 400 });
  }

  try {
    await handleEvent(event);
  } catch (err) {
    console.error("Stripe webhook handler failed", event.type, event.id, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
