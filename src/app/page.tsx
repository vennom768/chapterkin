import Link from "next/link";
import { BookOpen, MoonStar, Sparkles, Users } from "lucide-react";
import { LandingStoryPreview } from "@/components/landing-story-preview";
import { PlanPicker } from "@/components/plan-picker";
import { isAdminEmail } from "@/lib/admin";
import { getUsage } from "@/lib/billing";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) {
    const usage = await getUsage(user.id);
    if (!usage.paid && !isAdminEmail(user.email)) {
      redirect("/pricing?pay=1");
    }
    redirect("/home");
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex min-w-0 items-center gap-2 text-navy">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-gold">
            <MoonStar className="h-5 w-5" />
          </span>
          <span className="truncate font-serif text-2xl">ChapterKin</span>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/sign-in"
            className="inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-semibold text-navy hover:bg-gold/20"
          >
            Sign in
          </Link>
          <Link
            href="/pricing"
            className="inline-flex min-h-11 items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            <span className="sm:hidden">Plans</span>
            <span className="hidden sm:inline">See plans</span>
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-16 h-64 w-64 rounded-full bg-gold/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 top-24 h-56 w-56 rounded-full bg-accent/10 blur-3xl"
          />
          <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-6 sm:pb-16 sm:pt-10">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">
                Bedtime, made just for them
              </p>
              <h1 className="mt-3 font-serif text-3xl leading-tight text-navy sm:text-4xl md:text-5xl">
                A new customized story every night.
              </h1>
              <p className="mt-4 text-base leading-7 text-muted sm:text-lg sm:leading-8">
                Try the sample book below, then pick a plan. After you pay, one
                family login lets you add the kids, siblings, grandparents, and
                pets. Then write a kind, age-right story for tonight.
              </p>
              <p className="mt-3 text-base leading-7 text-navy sm:text-lg sm:leading-8">
                The same book can help teach reading. Start with first words,
                then short sentences, then the parent read-aloud.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/pricing"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark"
                >
                  See plans and start
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-navy"
                >
                  I already have an account
                </Link>
                <Link
                  href="#plans"
                  className="inline-flex min-h-12 items-center justify-center text-sm font-semibold text-accent"
                >
                  Compare plans
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/60">
          <div className="mx-auto grid max-w-5xl items-start gap-8 px-4 py-12 md:grid-cols-2 md:gap-12 md:py-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">
                Open a sample
              </p>
              <h2 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">
                This is how tonight can look.
              </h2>
              <p className="mt-3 text-base leading-7 text-muted">
                Tap through a short Maya story. Switch from first words to the
                parent read-aloud to see how one book can grow with a child who
                is learning to read.
              </p>
              <p className="mt-4 text-sm text-muted">
                Your stories use your child&apos;s look, the people and pets you
                list, and whatever happened today. You can use a photo once to
                draw them. We never keep the photo.
              </p>
            </div>
            <LandingStoryPreview />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Practice reading
          </p>
          <h2 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">
            Bedtime can double as reading time.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            Kids want to read about themselves. ChapterKin keeps the same
            pictures and the same night, then changes the wording so a new
            reader can try a page and a parent can finish the book.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="rounded-3xl border border-border bg-card p-5">
              <p className="font-serif text-xl text-navy">Learn to read</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                First words, then short sentences. A child can point, sound out,
                and feel like the story is theirs.
              </p>
            </article>
            <article className="rounded-3xl border border-border bg-card p-5">
              <p className="font-serif text-xl text-navy">Parent read-aloud</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                The usual bedtime voice. Soft, kind, and long enough to settle
                the room.
              </p>
            </article>
            <article className="rounded-3xl border border-border bg-card p-5">
              <p className="font-serif text-xl text-navy">Growing reader</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Richer words for practice, still the same people, pets, and
                pictures.
              </p>
            </article>
          </div>
        </section>

        <section className="border-t border-border/70 bg-[#fbf6ec]">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              How it works
            </p>
            <h2 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">
              Add the family once. Write tonight.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <article className="rounded-3xl border border-border bg-card p-5">
                <Users className="h-6 w-6 text-accent" />
                <p className="mt-3 font-serif text-xl text-navy">Tell us who</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Names, what you call them, boy or girl, and the people and
                  pets who belong in their world.
                </p>
              </article>
              <article className="rounded-3xl border border-border bg-card p-5">
                <Sparkles className="h-6 w-6 text-accent" />
                <p className="mt-3 font-serif text-xl text-navy">Draw their look</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Build a storybook drawing, or use a photo once. Then pick the
                  picture stories should use.
                </p>
              </article>
              <article className="rounded-3xl border border-border bg-card p-5">
                <BookOpen className="h-6 w-6 text-accent" />
                <p className="mt-3 font-serif text-xl text-navy">Read tonight</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Generate a new book or the next chapter, then choose who is
                  reading: learner, parent, or growing reader.
                </p>
              </article>
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark"
              >
                See plans and start
              </Link>
              <Link
                href="#plans"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-navy"
              >
                Compare plans
              </Link>
            </div>
          </div>
        </section>

        <section id="plans" className="mx-auto max-w-5xl px-4 pb-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Plans
          </p>
          <h2 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">
            Choose a plan to start.
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            No free accounts. Pick a plan, create the parent login, and pay.
            Then add the kids. Cancel anytime.
          </p>
          <div className="mt-8">
            <PlanPicker signedIn={false} />
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>ChapterKin · bedtime stories for your family</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/pricing" className="font-semibold text-navy">
            Pricing
          </Link>
          <Link href="/privacy" className="font-semibold text-navy">
            Privacy
          </Link>
          <Link href="/terms" className="font-semibold text-navy">
            Terms
          </Link>
          <Link href="/support" className="font-semibold text-navy">
            Support
          </Link>
          <Link href="/sign-in" className="font-semibold text-navy">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
