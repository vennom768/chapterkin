import Link from "next/link";
import { notFound } from "next/navigation";
import { ChildForm } from "@/components/child-form";
import { DeleteChildButton } from "@/components/delete-child-button";
import { Card } from "@/components/ui/card";
import { getChildForUser } from "@/lib/queries/children";
import { requireFamily } from "@/lib/session";

export default async function EditChildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, children } = await requireFamily();
  const { id } = await params;
  const child = await getChildForUser(user.id, id);
  if (!child) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent">
            <Link href="/family">Family</Link>
          </p>
          <h1 className="font-serif text-3xl text-navy sm:text-4xl">{child.name}</h1>
          <p className="mt-1 text-muted">
            Appearance and favorites for this child. Siblings and pets live on
            the family page.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            href={`/children/${child.id}/portrait`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-gold/20 sm:w-auto"
          >
            {child.selectedPortraitId ? "Child drawing" : "Draw their picture"}
          </Link>
          <Link
            href={`/stories/new?childId=${child.id}`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark sm:w-auto"
          >
            New story
          </Link>
        </div>
      </div>
      <Card>
        <ChildForm child={child} />
      </Card>
      {children.length > 1 ? (
        <DeleteChildButton childId={child.id} name={child.name} />
      ) : (
        <p className="text-sm text-muted">
          A family needs at least one child. Add another before removing this
          profile.
        </p>
      )}
    </div>
  );
}
