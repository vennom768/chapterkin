import Link from "next/link";
import { notFound } from "next/navigation";
import { PortraitStudio } from "@/components/portrait-studio";
import { Card } from "@/components/ui/card";
import { getChildForUser } from "@/lib/queries/children";
import { listPortraitsForChild } from "@/lib/queries/portraits";
import { requireFamily } from "@/lib/session";

export const maxDuration = 180;

export default async function ChildPortraitPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ drawing?: string }>;
}) {
  const { user } = await requireFamily();
  const { id } = await params;
  const { drawing } = await searchParams;
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
          Pick the drawing that should appear in their stories.
        </p>
      </div>
      <Card>
        <PortraitStudio
          childId={child.id}
          childName={child.calledBy || child.name}
          selectedPortraitId={child.selectedPortraitId}
          packs={child.portraitPacks}
          drawing={drawing === "1"}
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
