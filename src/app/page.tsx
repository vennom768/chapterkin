import Link from "next/link";
import { MoonStar } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) {
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
            href="/sign-up"
            className="inline-flex min-h-11 items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            <span className="sm:hidden">Join</span>
            <span className="hidden sm:inline">Create account</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:pt-10">
        <section className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              Bedtime, made just for them
            </p>
            <h1 className="mt-3 font-serif text-3xl leading-tight text-navy sm:text-4xl md:text-5xl">
              A new customized story every night.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted sm:text-lg sm:leading-8">
              One family account. Add the kids, siblings, grandparents, and
              pets once. Then pick a child and generate a kind, age-right story
              for tonight — standalone or the next chapter of a series.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/sign-up"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark"
              >
                Start a complimentary story
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-navy"
              >
                I already have an account
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-12 items-center justify-center text-sm font-semibold text-accent"
              >
                See plans
              </Link>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-[0_18px_50px_-28px_rgba(44,24,16,0.45)] sm:rounded-[2rem] sm:p-8">
            <p className="font-serif text-2xl text-navy">Tonight&apos;s page</p>
            <p className="mt-4 font-serif text-lg leading-8 sm:text-xl">
              Maya pulled on her yellow raincoat. Biscuit trotted beside her,
              ears flopping, as the two of them followed Nana&apos;s porch light
              through the gentle rain.
            </p>
            <p className="mt-6 text-sm text-muted">
              Stories remember the people and pets you list. Pictures use the
              appearance notes you write — no photos needed.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
