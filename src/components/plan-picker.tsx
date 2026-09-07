import { formatPrice, planStoryLabel, PLANS } from "@/lib/plans";
import { CheckoutButton } from "@/components/checkout-button";

export function PlanPicker({
  currentPlanId,
  signedIn,
}: {
  currentPlanId?: string | null;
  signedIn: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Object.values(PLANS).map((plan) => {
        const current = currentPlanId === plan.id;
        return (
          <div
            key={plan.id}
            className={`flex flex-col rounded-[1.75rem] border bg-card p-6 shadow-[0_10px_30px_-18px_rgba(44,24,16,0.35)] ${
              "popular" in plan && plan.popular
                ? "border-accent"
                : "border-border"
            }`}
          >
            {"popular" in plan && plan.popular ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                Most families
              </p>
            ) : (
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Monthly
              </p>
            )}
            <h2 className="mt-2 font-serif text-2xl text-navy">{plan.name}</h2>
            <p className="mt-1 text-3xl font-semibold text-navy">
              {formatPrice(plan.priceCents)}
              <span className="text-base font-normal text-muted">/mo</span>
            </p>
            <p className="mt-2 text-sm font-semibold text-accent">
              {planStoryLabel(plan.storiesPerMonth)}
            </p>
            <p className="mt-3 flex-1 text-sm leading-6 text-muted">{plan.blurb}</p>
            <div className="mt-6">
              {current ? (
                <p className="inline-flex min-h-11 items-center text-sm font-semibold text-navy">
                  Your current plan
                </p>
              ) : (
                <CheckoutButton planId={plan.id} signedIn={signedIn} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
