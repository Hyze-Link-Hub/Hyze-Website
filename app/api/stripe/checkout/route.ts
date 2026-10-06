import {
  getStripe,
  getStripeProPriceId,
  getStripePublishableKey,
  StripeConfigError,
} from "@/lib/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const USER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Stable label so these sessions group together in the Stripe Dashboard.
const INTEGRATION_IDENTIFIER = "hazy_pro_checkout_vqnlxmkt";

function appOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) {
    throw new StripeConfigError(
      "Missing NEXT_PUBLIC_BASE_URL. Set it to your site origin so Stripe can redirect after checkout.",
    );
  }
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function findOrCreateCustomer(userId: string, email: string | undefined) {
  const stripe = getStripe();
  const existing = await stripe.customers.search({
    query: `metadata['user_id']:"${userId}"`,
    limit: 1,
  });
  if (existing.data[0]) return existing.data[0].id;

  const created = await stripe.customers.create(
    {
      email,
      metadata: { user_id: userId },
    },
    { idempotencyKey: `hazy-pro-customer-${userId}` },
  );
  return created.id;
}

async function reusableCustomerId(customerId: string | null): Promise<string | null> {
  if (!customerId) return null;
  try {
    const customer = await getStripe().customers.retrieve(customerId);
    if ("deleted" in customer && customer.deleted) return null;
    return customer.id;
  } catch (err) {
    if (err instanceof Stripe.errors.StripeInvalidRequestError && err.code === "resource_missing") {
      return null;
    }
    throw err;
  }
}

async function checkoutModeForPrice(priceId: string): Promise<"payment" | "subscription"> {
  const price = await getStripe().prices.retrieve(priceId);
  if (price.type === "recurring") return "subscription";
  return "payment";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (!USER_ID.test(user.id)) {
    return NextResponse.json({ error: "Invalid account" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, is_premium, stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  if (profile.is_premium) {
    return NextResponse.json(
      { error: "You already have Lifetime Pro access." },
      { status: 409 },
    );
  }

  try {
    // Hosted Checkout does not render with the publishable key, but production
    // setup still requires it so client and server keys stay paired.
    getStripePublishableKey();
    const priceId = getStripeProPriceId();
    const origin = appOrigin(request);
    const mode = await checkoutModeForPrice(priceId);

    let customerId = await reusableCustomerId(profile.stripe_customer_id);
    if (!customerId) {
      customerId = await findOrCreateCustomer(user.id, user.email ?? undefined);
      const { error } = await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    console.log("=== STRIPE RUNTIME DEBUG ===");
    console.log(
      "Active Key Prefix:",
      process.env.STRIPE_SECRET_KEY
        ? process.env.STRIPE_SECRET_KEY.slice(0, 8)
        : "UNDEFINED",
    );
    console.log("Price ID Attempted:", process.env.STRIPE_PRO_PRICE_ID || "UNDEFINED");
    console.log("============================");

    const session = await getStripe().checkout.sessions.create({
      mode,
      customer: customerId,
      client_reference_id: user.id,
      allow_promotion_codes: true,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?checkout=canceled`,
      metadata: { user_id: user.id },
      ...(mode === "subscription"
        ? {
            subscription_data: {
              metadata: { user_id: user.id },
            },
          }
        : {
            payment_intent_data: {
              metadata: { user_id: user.id },
            },
          }),
      integration_identifier: INTEGRATION_IDENTIFIER,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Checkout did not return a redirect URL." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof StripeConfigError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    if (err instanceof Stripe.errors.StripeError) {
      console.error("Stripe checkout failed", err.type, err.message);
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error("Stripe checkout failed", err);
    return NextResponse.json({ error: "Checkout is unavailable right now." }, { status: 500 });
  }
}
