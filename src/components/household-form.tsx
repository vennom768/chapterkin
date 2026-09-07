"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveHousehold } from "@/lib/actions/family";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type HouseholdDraft = {
  name: string;
  relationship: "parent" | "grandparent" | "friend" | "pet" | "other";
  appearance: string;
  speciesOrBreed: string;
};

export function HouseholdForm({
  members,
}: {
  members: HouseholdDraft[];
}) {
  const [household, setHousehold] = useState<HouseholdDraft[]>(members);
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
            appearance: member.appearance.trim() || null,
            speciesOrBreed: member.speciesOrBreed.trim() || null,
          })),
      ),
    [household],
  );

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Shared people and pets. Siblings are the other kids in this family.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() =>
            setHousehold((current) => [
              ...current,
              {
                name: "",
                relationship: "grandparent",
                appearance: "",
                speciesOrBreed: "",
              },
            ])
          }
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      {household.map((member, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-2xl border border-border bg-white p-4 sm:grid-cols-2"
        >
          <div>
            <Label>Name</Label>
            <Input
              value={member.name}
              onChange={(event) =>
                setHousehold((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index
                      ? { ...item, name: event.target.value }
                      : item,
                  ),
                )
              }
            />
          </div>
          <div>
            <Label>Who they are</Label>
            <select
              className="min-h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base"
              value={member.relationship}
              onChange={(event) =>
                setHousehold((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index
                      ? {
                          ...item,
                          relationship: event.target
                            .value as HouseholdDraft["relationship"],
                        }
                      : item,
                  ),
                )
              }
            >
              <option value="parent">Parent</option>
              <option value="grandparent">Grandparent</option>
              <option value="friend">Friend</option>
              <option value="pet">Pet</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label>Appearance</Label>
            <Input
              value={member.appearance}
              onChange={(event) =>
                setHousehold((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index
                      ? { ...item, appearance: event.target.value }
                      : item,
                  ),
                )
              }
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label>Species or breed</Label>
              <Input
                value={member.speciesOrBreed}
                onChange={(event) =>
                  setHousehold((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, speciesOrBreed: event.target.value }
                        : item,
                    ),
                  )
                }
              />
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
      ))}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save household"}
      </Button>
    </form>
  );
}
