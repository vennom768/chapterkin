"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveHousehold } from "@/lib/actions/family";
import { LookBuilder } from "@/components/look-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appearanceFromLook } from "@/lib/looks";

type Relationship = "parent" | "grandparent" | "friend" | "pet" | "other";

type HouseholdDraft = {
  name: string;
  relationship: Relationship;
  appearance: string;
  speciesOrBreed: string;
  hair: string;
  eyes: string;
  skin: string;
  usualClothes: string;
};

const emptyMember = (relationship: Relationship = "parent"): HouseholdDraft => ({
  name: "",
  relationship,
  appearance: "",
  speciesOrBreed: "",
  hair: "",
  eyes: "",
  skin: "",
  usualClothes: "",
});

export function HouseholdForm({
  members,
}: {
  members: HouseholdDraft[];
}) {
  const [household, setHousehold] = useState<HouseholdDraft[]>(
    members.length ? members : [],
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const householdJson = useMemo(
    () =>
      JSON.stringify(
        household
          .filter((member) => member.name.trim())
          .map((member) => ({
            name: member.name.trim(),
            relationship: member.relationship,
            appearance:
              member.appearance.trim() ||
              appearanceFromLook(member) ||
              null,
            speciesOrBreed: member.speciesOrBreed.trim() || null,
            hair: member.hair.trim() || null,
            eyes: member.eyes.trim() || null,
            skin: member.skin.trim() || null,
            usualClothes: member.usualClothes.trim() || null,
          })),
      ),
    [household],
  );

  function add(relationship: Relationship) {
    setHousehold((current) => [...current, emptyMember(relationship)]);
  }

  function update(index: number, patch: Partial<HouseholdDraft>) {
    setHousehold((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  return (
    <form
      className="space-y-4"
      action={async (formData) => {
        setPending(true);
        setError(null);
        try {
          await saveHousehold(formData);
          setPending(false);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Could not save household.",
          );
          setPending(false);
        }
      }}
    >
      <input type="hidden" name="household" value={householdJson} />
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">
          Parents, grandparents, friends, and pets can be built like a child so
          they look the same in every book. Horses, ponies, barn animals,
          reptiles, and other uncommon pets are fine. Siblings are the other
          kids in this family.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => add("parent")}>
            <Plus className="h-4 w-4" />
            Parent
          </Button>
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => add("grandparent")}>
            <Plus className="h-4 w-4" />
            Grandparent
          </Button>
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => add("pet")}>
            <Plus className="h-4 w-4" />
            Pet
          </Button>
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => add("friend")}>
            <Plus className="h-4 w-4" />
            Friend
          </Button>
        </div>
      </div>
      {household.map((member, index) => (
        <div
          key={`${member.relationship}-${index}`}
          className="space-y-4 rounded-2xl border border-border bg-white p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input
                value={member.name}
                onChange={(event) => update(index, { name: event.target.value })}
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label>Who they are</Label>
                <select
                  className="min-h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base"
                  value={member.relationship}
                  onChange={(event) =>
                    update(index, {
                      relationship: event.target.value as Relationship,
                    })
                  }
                >
                  <option value="parent">Parent</option>
                  <option value="grandparent">Grandparent</option>
                  <option value="friend">Friend</option>
                  <option value="pet">Pet</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setHousehold((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <LookBuilder
            kind={member.relationship === "pet" ? "pet" : "person"}
            hair={member.hair || member.appearance}
            eyes={member.eyes}
            skin={member.skin}
            usualClothes={member.usualClothes || member.appearance}
            onChange={(look) =>
              update(index, {
                hair: look.hair,
                eyes: look.eyes,
                skin: look.skin,
                usualClothes: look.usualClothes,
                appearance: look.appearance,
                speciesOrBreed: look.speciesOrBreed,
              })
            }
          />
        </div>
      ))}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save household"}
      </Button>
    </form>
  );
}
