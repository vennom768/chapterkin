import Link from "next/link";
import { notFound } from "next/navigation";
import { StoryEditor } from "@/components/story-editor";
import { Card } from "@/components/ui/card";
import { getStoryForUser } from "@/lib/queries/stories";
import { requireUser } from "@/lib/session";

export default async function EditStoryPage({
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
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent">
          <Link href={`/stories/${result.story.id}`}>Back to the book</Link>
        </p>
        <h1 className="font-serif text-3xl text-navy sm:text-4xl">
          Revise {result.story.title}
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Keep the pages you love. Select only the ones that need a rewrite and
          a new picture.
        </p>
      </div>
      <Card>
        <StoryEditor
          storyId={result.story.id}
          title={result.story.title}
          pages={result.pages}
        />
      </Card>
    </div>
  );
}
