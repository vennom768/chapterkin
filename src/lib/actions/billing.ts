"use server";

import { redirect } from "next/navigation";
import { getAppUrl } from "@/lib/app-url";
import { getSubscriptionForUser } from "@/lib/billing";
import { isPlanId } from "@/lib/plans";
import { requireUser } from "@/lib/session";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export async function startCheckout(planId: string) {
  const user = await requireUser();
  if (!isPlanId(planId)) {
    throw new Error("Choose a plan.");
  }
  if (!isStripeConfigured()) {
    throw new Error("Payments are not configured yet.");
  }
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Payments are not configured yet.");
  }
  const plan = (await import("@/lib/plans")).PLANS[planId];
  const existing = await getSubscriptionForUser(user.id);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existing?.stripeCustomerId ?? undefined,
    customer_email: existing?.stripeCustomerId ? undefined : user.email,
    client_reference_id: user.id,
    metadata: { userId: user.id, planId },
    subscription_data: {
      metadata: { userId: user.id, planId },
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: plan.priceCents,
          recurring: { interval: "month" },
          product_data: {
            name: `Chapterkin · ${plan.name}`,
            description: plan.blurb,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${getAppUrl()}/billing?checkout=success`,
    cancel_url: `${getAppUrl()}/pricing`,
  });
  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }
  redirect(session.url);
}

export async function openBillingPortal() {
  const user = await requireUser();
  const stripe = getStripe();
  const existing = await getSubscriptionForUser(user.id);
  if (!stripe || !existing?.stripeCustomerId) {
    redirect("/pricing");
  }
  const portal = await stripe.billingPortal.sessions.create({
    customer: existing.stripeCustomerId,
    return_url: `${getAppUrl()}/billing`,
  });
  redirect(portal.url);
}
