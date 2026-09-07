import Link from "next/link";
import { redirect } from "next/navigation";
import { StoryComposer } from "@/components/story-composer";
import { Card } from "@/components/ui/card";
import { getUsage } from "@/lib/billing";
import { listSeriesForChild } from "@/lib/queries/children";
import { requireFamily } from "@/lib/session";

export default async function NewStoryPage({
  searchParams,
}: {
  searchParams: Promise<{ childId?: string; seriesId?: string }>;
}) {
  const { user, children } = await requireFamily();
  const { childId, seriesId } = await searchParams;
  const child = children.find((item) => item.id === childId);

  if (!child) {
    redirect("/home");
  }

  const childSeries = await listSeriesForChild(user.id, child.id);
  const siblings = children.filter((item) => item.id !== child.id);
  const usage = await getUsage(user.id);
  const quotaLabel = usage.limit == null
    ? "Unlimited stories on your plan."
    : usage.paid
      ? `${usage.remaining} of ${usage.limit} stories left this month.`
      : usage.canGenerate
        ? "Your complimentary first story is ready."
        : "Your complimentary story is used.";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent">
          <Link href="/home">Choose a different child</Link>
        </p>
        <h1 className="font-serif text-3xl text-navy sm:text-4xl">
          A story for {child.calledBy || child.name}
        </h1>
        <p className="mt-1 max-w-2xl text-muted">
          Age {child.age}
          {siblings.length
            ? ` · siblings: ${siblings.map((item) => item.calledBy || item.name).join(", ")}`
            : ""}
          . Add something from today if you want it woven in.
        </p>
      </div>
      <Card>
        <StoryComposer
          childrenOptions={children.map((item) => ({
            id: item.id,
            name: item.name,
            age: item.age,
          }))}
          seriesOptions={childSeries.map((series) => ({
            id: series.id,
            title: series.title,
            childId: series.childId,
          }))}
          defaultChildId={child.id}
          defaultSeriesId={seriesId}
          lockChild
          canGenerate={usage.canGenerate}
          quotaLabel={quotaLabel}
        />
      </Card>
    </div>
  );
}
