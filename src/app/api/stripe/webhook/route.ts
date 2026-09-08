import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { fulfillPortraitPack } from "@/lib/actions/portraits";
import { fulfillPageRevision } from "@/lib/actions/revisions";
import { upsertSubscription } from "@/lib/billing";
import { isPlanId } from "@/lib/plans";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

function unixToDate(value?: number | null) {
  return value ? new Date(value * 1000) : null;
}

function planFromSubscription(sub: Stripe.Subscription) {
  const raw = sub.metadata?.planId;
  return raw && isPlanId(raw) ? raw : "none";
}

async function syncSubscription(sub: Stripe.Subscription, userId: string) {
  const period = sub.items.data[0];
  await upsertSubscription({
    userId,
    stripeCustomerId:
      typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripeSubscriptionId: sub.id,
    planId: planFromSubscription(sub),
    status: sub.status,
    currentPeriodStart: unixToDate(period?.current_period_start),
    currentPeriodEnd: unixToDate(period?.current_period_end),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  });
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id ?? session.metadata?.userId;
    if (session.metadata?.kind === "page_revision" && session.metadata.revisionId) {
      await fulfillPageRevision(session.metadata.revisionId);
    } else if (session.metadata?.kind === "portrait_pack" && session.metadata.purchaseId) {
      await fulfillPortraitPack(session.metadata.purchaseId);
    } else if (userId && session.subscription) {
      const sub = await stripe.subscriptions.retrieve(String(session.subscription));
      await syncSubscription(sub, userId);
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.userId;
    if (userId) {
      await syncSubscription(sub, userId);
    }
  }

  return NextResponse.json({ received: true });
}
