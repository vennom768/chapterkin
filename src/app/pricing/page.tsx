import Link from "next/link";
import { PlanPicker } from "@/components/plan-picker";
import { getUsage } from "@/lib/billing";
import { getCurrentUser } from "@/lib/session";

export default async function PricingPage() {
  const user = await getCurrentUser();
  const usage = user ? await getUsage(user.id) : null;

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Link href="/" className="font-serif text-2xl text-navy">
          ChapterKin
        </Link>
        <Link
          href={user ? "/billing" : "/sign-in"}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-navy"
        >
          {user ? "Billing" : "Sign in"}
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Plans for bedtime
        </p>
        <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">
          Pay for the nights you actually write.
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          A printed picture book often costs about $15 for one copy. Plans
          start at $24.99 a month. Every family gets one complimentary story.
          Cancel anytime.
        </p>
        <div className="mt-8">
          <PlanPicker currentPlanId={usage?.planId} signedIn={Boolean(user)} />
        </div>
      </main>
    </div>
  );
}
