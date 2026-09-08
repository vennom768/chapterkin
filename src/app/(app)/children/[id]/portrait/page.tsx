import Link from "next/link";
import { notFound } from "next/navigation";
import { PortraitStudio } from "@/components/portrait-studio";
import { Card } from "@/components/ui/card";
import { getChildForUser } from "@/lib/queries/children";
import { listPortraitsForChild } from "@/lib/queries/portraits";
import { requireFamily } from "@/lib/session";

export const maxDuration = 120;

export default async function ChildPortraitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireFamily();
  const { id } = await params;
  const child = await getChildForUser(user.id, id);
  if (!child) {
    notFound();
  }
  const portraits = await listPortraitsForChild(user.id, id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent">
          <Link href={`/children/${child.id}`}>Back to {child.name}</Link>
        </p>
        <h1 className="font-serif text-3xl text-navy sm:text-4xl">
          {child.calledBy || child.name}&apos;s drawing
        </h1>
        <p className="mt-1 text-muted">
          Iterate here before you write a story. The drawing you pick is the
          child who appears in the book.
        </p>
      </div>
      <Card>
        <PortraitStudio
          childId={child.id}
          childName={child.calledBy || child.name}
          selectedPortraitId={child.selectedPortraitId}
          packs={child.portraitPacks}
          portraits={portraits.map((portrait) => ({
            id: portrait.id,
            imagePath: portrait.imagePath,
            source: portrait.source,
          }))}
        />
      </Card>
    </div>
  );
}
