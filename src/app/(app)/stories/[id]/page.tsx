import { after } from "next/server";
import { notFound } from "next/navigation";
import { StoryReader } from "@/components/story-reader";
import { getStoryForUser } from "@/lib/queries/stories";
import { resolvedReaderTexts } from "@/lib/reader-levels";
import { requireUser } from "@/lib/session";
import { ensureStoryReaderLevels } from "@/lib/story-reader-levels";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const result = await getStoryForUser(user.id, id);
  if (!result) {
    notFound();
  }
  after(() => {
    void ensureStoryReaderLevels(result.pages);
  });
  const pages = result.pages;

  return (
    <StoryReader
      storyId={result.story.id}
      title={result.story.title}
      childName={result.child.calledBy || result.child.name}
      childId={result.child.id}
      seriesId={result.story.seriesId}
      seriesTitle={result.series?.title}
      chapterNumber={result.story.chapterNumber}
      pages={pages.map((page) => ({
        id: page.id,
        pageIndex: page.pageIndex,
        kind: page.kind,
        text: page.text,
        texts: resolvedReaderTexts(page),
        imageStatus: page.imageStatus,
        imagePath: page.imagePath,
      }))}
    />
  );
}
