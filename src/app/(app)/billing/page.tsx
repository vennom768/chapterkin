import Link from "next/link";
import { BillingPortalButton } from "@/components/billing-portal-button";
import { PlanPicker } from "@/components/plan-picker";
import { PromoRedeemForm } from "@/components/promo-redeem-form";
import { Card } from "@/components/ui/card";
import { getUsage } from "@/lib/billing";
import { planStoryLabel } from "@/lib/plans";
import { requireUser } from "@/lib/session";
import { isStripeConfigured } from "@/lib/stripe";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const user = await requireUser();
  const { checkout } = await searchParams;
  const usage = await getUsage(user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-navy sm:text-4xl">Billing</h1>
        <p className="mt-1 text-muted">
          Stories are counted per family, for the current month on your plan.
        </p>
      </div>

      {checkout === "success" ? (
        <Card>
          <p className="font-semibold text-navy">You&apos;re subscribed.</p>
          <p className="mt-1 text-sm text-muted">
            It can take a few seconds for Stripe to finish. Refresh if this
            page still shows the complimentary story.
          </p>
        </Card>
      ) : null}

      <Card className="space-y-3">
        <h2 className="font-serif text-2xl text-navy">This month</h2>
        <p className="text-lg">
          {usage.promo
            ? "Tester promo · Unlimited stories"
            : usage.paid
              ? usage.plan
                ? `${usage.plan.name} · ${planStoryLabel(usage.plan.storiesPerMonth)}`
                : "Active plan"
              : "Complimentary first story"}
        </p>
        <p className="text-muted">
          {usage.limit == null
            ? `${usage.used} stories written this period.`
            : `${usage.used} of ${usage.limit} stories used.`}
        </p>
        {usage.record?.currentPeriodEnd ? (
          <p className="text-sm text-muted">
            Renews {usage.record.currentPeriodEnd.toLocaleDateString()}.
            {usage.record.cancelAtPeriodEnd ? " Cancellation is scheduled." : ""}
          </p>
        ) : null}
        {usage.paid && usage.record?.stripeCustomerId ? <BillingPortalButton /> : null}
        {!isStripeConfigured() ? (
          <p className="text-sm text-muted">
            Stripe keys are not set yet, so checkout will not open. Add
            STRIPE_SECRET_KEY to the environment.
          </p>
        ) : null}
      </Card>

      {!usage.paid ? (
        <Card className="space-y-3">
          <h2 className="font-serif text-2xl text-navy">Have a promo code?</h2>
          <p className="text-sm text-muted">
            Testers can apply a code here for a free unlimited account.
          </p>
          <PromoRedeemForm />
        </Card>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-navy">Change plan</h2>
        <PlanPicker currentPlanId={usage.planId} signedIn />
        <p className="text-sm text-muted">
          Need the public page?{" "}
          <Link href="/pricing" className="font-semibold text-accent">
            View pricing
          </Link>
        </p>
      </section>
    </div>
  );
}
