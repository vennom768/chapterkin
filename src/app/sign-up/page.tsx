import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { PlanPicker } from "@/components/plan-picker";
import { Card } from "@/components/ui/card";
import { formatPrice, isPlanId, PLANS } from "@/lib/plans";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const planId = plan && isPlanId(plan) ? plan : null;
  const selected = planId ? PLANS[planId] : null;

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Link href="/" className="font-serif text-2xl text-navy">
          ChapterKin
        </Link>
        <Link href="/sign-in" className="text-sm font-semibold text-navy">
          Sign in
        </Link>
      </header>
      <main className="mx-auto max-w-5xl space-y-8 px-4 pb-16 pt-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Start a family plan
          </p>
          <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">
            Pay first, then add the kids.
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            ChapterKin is a paid family account. Pick a plan, create the parent
            login, and you will go to checkout. After that you add the kids and
            write tonight&apos;s story. Testers can use a promo code instead.
          </p>
        </div>
        <PlanPicker signedIn={false} currentPlanId={planId} />
        <Card className="mx-auto max-w-md">
          <h2 className="font-serif text-2xl text-navy">Parent login</h2>
          <p className="mb-6 mt-1 text-sm text-muted">
            {selected
              ? `You chose ${selected.name} · ${formatPrice(selected.priceCents)}/mo. Create the login, then finish payment.`
              : "Choose a plan above, or enter a tester promo code below."}
          </p>
          <Suspense>
            <AuthForm mode="sign-up" />
          </Suspense>
        </Card>
      </main>
    </div>
  );
}
