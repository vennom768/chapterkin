import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { StoryTile } from "@/components/story-tile";
import { Card } from "@/components/ui/card";
import { formatAge } from "@/lib/age";
import { getUsage } from "@/lib/billing";
import { listStories } from "@/lib/queries/stories";
import { requireFamily } from "@/lib/session";

export default async function HomePage() {
  const { user, family, children } = await requireFamily();
  const [stories, usage] = await Promise.all([
    listStories(user.id),
    getUsage(user.id),
  ]);
  const recent = stories.slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          {family.name}
        </p>
        <h1 className="font-serif text-3xl text-navy sm:text-4xl">Who is tonight&apos;s story for?</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Pick a child. We&apos;ll write a story just for them, using your
          family, siblings, and whatever happened today.
        </p>
        <p className="mt-3 text-sm font-semibold text-navy">
          {usage.limit == null
            ? "Unlimited stories this month."
            : usage.paid
              ? `${usage.remaining} of ${usage.limit} stories left this month.`
              : usage.canGenerate
                ? "One complimentary story included."
                : "Complimentary story used."}{" "}
          <Link href="/billing" className="text-accent">
            Billing
          </Link>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {children.map((child) => (
          <Card key={child.id} className="flex h-full flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                {formatAge(child.age, child.ageMonths)}
                {child.calledBy && child.calledBy !== child.name
                  ? ` · you call them ${child.calledBy}`
                  : ""}
              </p>
              <h2 className="mt-1 font-serif text-3xl text-navy">
                {child.calledBy || child.name}
              </h2>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href={`/stories/new?childId=${child.id}`}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark sm:w-auto"
              >
                Write tonight&apos;s story
              </Link>
              <Link
                href={`/children/${child.id}/portrait`}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-gold/20 sm:w-auto"
              >
                {child.selectedPortraitId ? "Child drawing" : "Draw their picture"}
              </Link>
              <Link
                href={`/children/${child.id}`}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-gold/20 sm:w-auto"
              >
                Edit details
              </Link>
            </div>
          </Card>
        ))}
      </div>
      <Link
        href="/children/new"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-gold/20 sm:w-auto"
      >
        Add a child
      </Link>

      {recent.length > 0 ? (
        <section>
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-serif text-2xl text-navy">Family library</h2>
            <Link href="/library" className="text-sm font-semibold text-accent">
              Open the full library
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {recent.map(({ story, childName, seriesTitle, cover }) => (
              <StoryTile
                key={story.id}
                storyId={story.id}
                title={story.title}
                synopsis={story.synopsis}
                childName={childName}
                seriesTitle={seriesTitle}
                chapterNumber={story.chapterNumber}
                coverPageId={cover?.id}
                coverReady={cover?.imageStatus === "ready" && Boolean(cover.imagePath)}
              />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          title="The library is waiting"
          body="After you generate a story, it will live here so you can read it again tomorrow."
        />
      )}
    </div>
  );
}
