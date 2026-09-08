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
          Save their details, then draw a storybook picture of them before you
          write a story.
        </p>
      </div>
      <Card>
        <ChildForm />
      </Card>
    </div>
  );
}
