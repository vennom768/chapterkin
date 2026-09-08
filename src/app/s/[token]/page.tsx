import { after } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StoryReader } from "@/components/story-reader";
import { markStoryRead } from "@/lib/actions/story-sharing";
import { getStoryByShareToken } from "@/lib/queries/shared-stories";
import { resolvedReaderTexts } from "@/lib/reader-levels";
import { ensureStoryReaderLevels } from "@/lib/story-reader-levels";

export default async function SharedStoryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await getStoryByShareToken(token);
  if (!result) {
    notFound();
  }
  after(() => {
    void ensureStoryReaderLevels(result.pages);
    void markStoryRead(result.story.id);
  });

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border/80 px-4 py-3">
        <Link href="/" className="font-serif text-xl text-navy">
          ChapterKin
        </Link>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
        <StoryReader
          storyId={result.story.id}
          title={result.story.title}
          childName={result.child.calledBy || result.child.name}
          childId={result.child.id}
          seriesId={result.story.seriesId}
          seriesTitle={result.series?.title}
          chapterNumber={result.story.chapterNumber}
          shared
          shareToken={token}
          pages={result.pages.map((page) => ({
            id: page.id,
            pageIndex: page.pageIndex,
            kind: page.kind,
            text: page.text,
            texts: resolvedReaderTexts(page),
            imageStatus: page.imageStatus,
            imagePath: page.imagePath,
          }))}
        />
      </main>
    </div>
  );
}
