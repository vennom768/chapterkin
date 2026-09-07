import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { StoryTile } from "@/components/story-tile";
import { listSeries, listStories } from "@/lib/queries/stories";
import { requireFamily } from "@/lib/session";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ childId?: string; seriesId?: string }>;
}) {
  const { user, children } = await requireFamily();
  const { childId, seriesId } = await searchParams;
  const [series, stories] = await Promise.all([
    listSeries(user.id),
    listStories(user.id, {
      childId: childId || undefined,
      seriesId: seriesId && seriesId !== "standalone" ? seriesId : undefined,
      standaloneOnly: seriesId === "standalone",
    }),
  ]);

  const queryFor = (next: { childId?: string; seriesId?: string }) => {
    const params = new URLSearchParams();
    if (next.childId) params.set("childId", next.childId);
    if (next.seriesId) params.set("seriesId", next.seriesId);
    const query = params.toString();
    return query ? `/library?${query}` : "/library";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-navy sm:text-4xl">Family library</h1>
        <p className="mt-1 text-muted">
          Every night, for every child. Re-read or write the next chapter.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={queryFor({ seriesId })}
          className={`inline-flex min-h-10 items-center rounded-full px-3 py-2 text-sm font-semibold ${
            !childId ? "bg-navy text-white" : "bg-white text-navy border border-border"
          }`}
        >
          All children
        </Link>
        {children.map((child) => (
          <Link
            key={child.id}
            href={queryFor({ childId: child.id, seriesId })}
            className={`inline-flex min-h-10 items-center rounded-full px-3 py-2 text-sm font-semibold ${
              childId === child.id
                ? "bg-navy text-white"
                : "bg-white text-navy border border-border"
            }`}
          >
            {child.name}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={queryFor({ childId })}
          className={`inline-flex min-h-10 items-center rounded-full px-3 py-2 text-sm font-semibold ${
            !seriesId ? "bg-accent text-white" : "bg-white text-navy border border-border"
          }`}
        >
          All stories
        </Link>
        <Link
          href={queryFor({ childId, seriesId: "standalone" })}
          className={`inline-flex min-h-10 items-center rounded-full px-3 py-2 text-sm font-semibold ${
            seriesId === "standalone"
              ? "bg-accent text-white"
              : "bg-white text-navy border border-border"
          }`}
        >
          Tonight only
        </Link>
        {series
          .filter((item) => !childId || item.series.childId === childId)
          .map(({ series: item }) => (
            <Link
              key={item.id}
              href={queryFor({ childId, seriesId: item.id })}
              className={`inline-flex min-h-10 items-center rounded-full px-3 py-2 text-sm font-semibold ${
                seriesId === item.id
                  ? "bg-accent text-white"
                  : "bg-white text-navy border border-border"
              }`}
            >
              {item.title}
            </Link>
          ))}
      </div>

      {stories.length === 0 ? (
        <EmptyState
          title="The shelf is empty"
          body="Generate a story tonight and it will live here for the next bedtime."
          actionHref="/home"
          actionLabel="Pick a child"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {stories.map(({ story, childName, seriesTitle, cover }) => (
            <div key={story.id} className="space-y-2">
              <StoryTile
                storyId={story.id}
                title={story.title}
                synopsis={story.synopsis}
                childName={childName}
                seriesTitle={seriesTitle}
                chapterNumber={story.chapterNumber}
                coverPageId={cover?.id}
                coverReady={cover?.imageStatus === "ready" && Boolean(cover.imagePath)}
              />
              {story.seriesId ? (
                <Link
                  href={`/stories/new?childId=${story.childId}&seriesId=${story.seriesId}`}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-accent"
                >
                  Write the next chapter
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
