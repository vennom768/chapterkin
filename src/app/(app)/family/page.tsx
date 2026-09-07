import Link from "next/link";
import { HouseholdForm } from "@/components/household-form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatAge } from "@/lib/age";
import { saveFamilyDetails } from "@/lib/actions/family";
import { requireFamily } from "@/lib/session";

export default async function FamilyPage() {
  const { family, children, household } = await requireFamily();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-navy sm:text-4xl">{family.name}</h1>
        <p className="mt-1 text-muted">
          Kids get their own stories. Everyone else is shared household.
        </p>
      </div>

      <Card>
        <h2 className="mb-4 font-serif text-2xl text-navy">Family details</h2>
        <form action={saveFamilyDetails} className="space-y-4">
          <div>
            <Label htmlFor="familyName">Family name</Label>
            <Input
              id="familyName"
              name="familyName"
              required
              defaultValue={family.name}
            />
          </div>
          <div>
            <Label htmlFor="notes">Household notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={family.notes ?? ""}
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark sm:w-auto"
          >
            Save family
          </button>
        </form>
      </Card>

      <section>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-serif text-2xl text-navy">Children</h2>
          <Link
            href="/children/new"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-accent"
          >
            Add another child
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((child) => (
            <Card key={child.id} className="flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-2xl text-navy">
                  {child.calledBy || child.name}
                </h3>
                <p className="text-sm text-muted">
                  {child.calledBy && child.calledBy !== child.name
                    ? `${child.name} · `
                    : ""}
                  {formatAge(child.age, child.ageMonths)}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/stories/new?childId=${child.id}`}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-accent"
                >
                  New story
                </Link>
                <Link
                  href={`/children/${child.id}`}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-navy"
                >
                  Edit profile
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Card>
        <h2 className="mb-4 font-serif text-2xl text-navy">
          Household people and pets
        </h2>
        <HouseholdForm
          members={household.map((member) => ({
            name: member.name,
            relationship: member.relationship as
              | "parent"
              | "grandparent"
              | "friend"
              | "pet"
              | "other",
            appearance: member.appearance ?? "",
            speciesOrBreed: member.speciesOrBreed ?? "",
            hair: member.hair ?? "",
            eyes: member.eyes ?? "",
            skin: member.skin ?? "",
            usualClothes: member.usualClothes ?? "",
          }))}
        />
      </Card>
    </div>
  );
}
