import { redirect } from "next/navigation";
import { FamilySetupForm } from "@/components/family-setup-form";
import { Card } from "@/components/ui/card";
import { getFamilyWithMembers } from "@/lib/queries/family";
import { requireUser } from "@/lib/session";

export default async function OnboardingPage() {
  const user = await requireUser();
  const household = await getFamilyWithMembers(user.id);
  if (household && household.children.length > 0) {
    redirect("/home");
  }

  const defaultName = user.name
    ? `The ${user.name.split(" ")[0]} family`
    : "Our family";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Family account
        </p>
        <h1 className="font-serif text-3xl text-navy sm:text-4xl">Tell us about your family</h1>
        <p className="mt-2 max-w-2xl text-muted">
          One family login. For each child, tell us their name, what you call
          them, their age, and a little about them. Tonight you just pick a
          child and generate.
        </p>
      </div>
      <Card>
        <FamilySetupForm defaultFamilyName={defaultName} />
      </Card>
    </div>
  );
}
