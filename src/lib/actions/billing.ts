"use server";

import { getAppUrl } from "@/lib/app-url";
import { isAdminEmail, isEmailVerificationRequired } from "@/lib/admin";
import { getSubscriptionForUser } from "@/lib/billing";
import { isPlanId } from "@/lib/plans";
import { getCurrentUser } from "@/lib/session";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export type BillingActionResult =
  | { ok: true; url: string }
  | { ok: false; error: string; redirectTo?: string };

type BillingUserResult =
  | { ok: true; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>> }
  | { ok: false; error: string; redirectTo?: string };

async function requireBillingUser(): Promise<BillingUserResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Sign in to continue.", redirectTo: "/sign-in" };
  }
  if (
    (await isEmailVerificationRequired()) &&
    !user.emailVerified &&
    !isAdminEmail(user.email)
  ) {
    return {
      ok: false,
      error: "Confirm your email first.",
      redirectTo: `/check-email?email=${encodeURIComponent(user.email)}`,
    };
  }
  return { ok: true, user };
}

function stripeErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
    return err.message;
  }
  return fallback;
}

export async function startCheckout(planId: string): Promise<BillingActionResult> {
  const auth = await requireBillingUser();
  if (!auth.ok) {
    return auth;
  }
  if (!isPlanId(planId)) {
    return { ok: false, error: "Choose a plan." };
  }
  if (!isStripeConfigured()) {
    return { ok: false, error: "Payments are not configured yet." };
  }
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, error: "Payments are not configured yet." };
  }
  const plan = (await import("@/lib/plans")).PLANS[planId];
  const existing = await getSubscriptionForUser(auth.user.id);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: existing?.stripeCustomerId ?? undefined,
      customer_email: existing?.stripeCustomerId ? undefined : auth.user.email,
      client_reference_id: auth.user.id,
      metadata: { userId: auth.user.id, planId },
      subscription_data: {
        metadata: { userId: auth.user.id, planId },
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: plan.priceCents,
            recurring: { interval: "month" },
            product_data: {
              name: `ChapterKin · ${plan.name}`,
              description: plan.blurb,
              tax_code: "txcd_10103000",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${getAppUrl()}/billing?checkout=success`,
      cancel_url: `${getAppUrl()}/pricing`,
    });
    if (!session.url) {
      return { ok: false, error: "Stripe did not return a checkout URL." };
    }
    return { ok: true, url: session.url };
  } catch (err) {
    return { ok: false, error: stripeErrorMessage(err, "Could not start checkout.") };
  }
}

export async function openBillingPortal(): Promise<BillingActionResult> {
  const auth = await requireBillingUser();
  if (!auth.ok) {
    return auth;
  }
  const stripe = getStripe();
  const existing = await getSubscriptionForUser(auth.user.id);
  if (!stripe || !existing?.stripeCustomerId) {
    return { ok: false, error: "No billing account yet.", redirectTo: "/pricing" };
  }
  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: existing.stripeCustomerId,
      return_url: `${getAppUrl()}/billing`,
    });
    if (!portal.url) {
      return { ok: false, error: "Could not open billing." };
    }
    return { ok: true, url: portal.url };
  } catch (err) {
    return { ok: false, error: stripeErrorMessage(err, "Could not open billing.") };
  }
}
