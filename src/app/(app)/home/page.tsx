import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { listStories } from "@/lib/queries/stories";
import { requireFamily } from "@/lib/session";

export default async function HomePage() {
  const { user, family, children } = await requireFamily();
  const stories = await listStories(user.id);
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {children.map((child) => (
          <Link key={child.id} href={`/stories/new?childId=${child.id}`}>
            <Card className="h-full transition-transform hover:-translate-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                Age {child.age}
                {child.calledBy && child.calledBy !== child.name
                  ? ` · you call them ${child.calledBy}`
                  : ""}
              </p>
              <h2 className="mt-1 font-serif text-3xl text-navy">
                {child.calledBy || child.name}
              </h2>
              <p className="mt-3 text-sm font-semibold text-accent">
                Write tonight&apos;s story
              </p>
            </Card>
          </Link>
        ))}
      </div>

      {recent.length > 0 ? (
        <section>
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-serif text-2xl text-navy">Family library</h2>
            <Link href="/library" className="text-sm font-semibold text-accent">
              Open the full library
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {recent.map(({ story, childName, seriesTitle }) => (
              <Link key={story.id} href={`/stories/${story.id}`}>
                <Card className="h-full transition-transform hover:-translate-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    {childName}
                    {seriesTitle ? ` · ${seriesTitle}` : ""}
                  </p>
                  <h3 className="mt-1 font-serif text-xl text-navy">
                    {story.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {story.synopsis}
                  </p>
                </Card>
              </Link>
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
