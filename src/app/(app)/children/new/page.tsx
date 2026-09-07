import { ChildForm } from "@/components/child-form";
import { Card } from "@/components/ui/card";
import { requireFamily } from "@/lib/session";

export default async function NewChildPage() {
  await requireFamily();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-navy sm:text-4xl">Add a child</h1>
        <p className="mt-1 text-muted">
          They&apos;ll join the family and can appear as a sibling in other
          kids&apos; stories.
        </p>
      </div>
      <Card>
        <ChildForm />
      </Card>
    </div>
  );
}
