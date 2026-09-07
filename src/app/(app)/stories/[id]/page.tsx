import { notFound } from "next/navigation";
import { StoryReader } from "@/components/story-reader";
import { getStoryForUser } from "@/lib/queries/stories";
import { requireUser } from "@/lib/session";

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

  return (
    <StoryReader
      storyId={result.story.id}
      title={result.story.title}
      childName={result.child.calledBy || result.child.name}
      childId={result.child.id}
      seriesId={result.story.seriesId}
      seriesTitle={result.series?.title}
      chapterNumber={result.story.chapterNumber}
      pages={result.pages}
    />
  );
}
