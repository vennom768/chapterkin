"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveFamilyOnboarding } from "@/lib/actions/family";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type KidDraft = {
  name: string;
  calledBy: string;
  age: string;
  favoriteThings: string;
  callsMom: string;
  callsDad: string;
};
type HouseholdDraft = {
  name: string;
  relationship: "parent" | "grandparent" | "friend" | "pet" | "other";
  appearance: string;
  speciesOrBreed: string;
};

const emptyKid = (): KidDraft => ({
  name: "",
  calledBy: "",
  age: "5",
  favoriteThings: "",
  callsMom: "",
  callsDad: "",
});
const emptyMember = (): HouseholdDraft => ({
  name: "",
  relationship: "grandparent",
  appearance: "",
  speciesOrBreed: "",
});

export function FamilySetupForm({ defaultFamilyName }: { defaultFamilyName: string }) {
  const [kids, setKids] = useState<KidDraft[]>([emptyKid()]);
  const [household, setHousehold] = useState<HouseholdDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const childrenJson = useMemo(
    () =>
      JSON.stringify(
        kids
          .filter(
            (kid) =>
              kid.name.trim() &&
              kid.calledBy.trim() &&
              kid.favoriteThings.trim(),
          )
          .map((kid) => ({
            name: kid.name.trim(),
            calledBy: kid.calledBy.trim(),
            age: Number(kid.age),
            favoriteThings: kid.favoriteThings.trim(),
            callsMom: kid.callsMom.trim() || null,
            callsDad: kid.callsDad.trim() || null,
          })),
      ),
    [kids],
  );

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
      className="space-y-8"
      action={async (formData) => {
        setPending(true);
        setError(null);
        try {
          await saveFamilyOnboarding(formData);
        } catch (err) {
          if (
            typeof err === "object" &&
            err &&
            "digest" in err &&
            String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
          ) {
            throw err;
          }
          setError(
            err instanceof Error ? err.message : "Could not save the family.",
          );
          setPending(false);
        }
      }}
    >
      <input type="hidden" name="children" value={childrenJson} />
      <input type="hidden" name="household" value={householdJson} />

      <section className="space-y-4">
        <div>
          <Label htmlFor="familyName">Family name</Label>
          <Input
            id="familyName"
            name="familyName"
            required
            defaultValue={defaultFamilyName}
            placeholder="The Rivera family"
          />
        </div>
        <div>
          <Label htmlFor="notes">Anything about your household</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="We live near the woods. Bedtime is cozy and a little silly."
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-xl text-navy">The kids</h2>
            <p className="text-sm text-muted">
              Name, what you call them, age, and a little about them. They
              become siblings in each other&apos;s stories.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => setKids((current) => [...current, emptyKid()])}
          >
            <Plus className="h-4 w-4" />
            Add child
          </Button>
        </div>
        <div className="space-y-4">
          {kids.map((kid, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-2xl border border-border bg-white p-4 sm:grid-cols-3"
            >
              <div>
                <Label>Name</Label>
                <Input
                  value={kid.name}
                  onChange={(event) =>
                    setKids((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, name: event.target.value }
                          : item,
                      ),
                    )
                  }
                  placeholder="Maya"
                  required={index === 0}
                />
              </div>
              <div>
                <Label>What you call them</Label>
                <Input
                  value={kid.calledBy}
                  onChange={(event) =>
                    setKids((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, calledBy: event.target.value }
                          : item,
                      ),
                    )
                  }
                  placeholder="May-May, buddy..."
                  required={index === 0}
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={kid.age}
                    onChange={(event) =>
                      setKids((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, age: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </div>
                {kids.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setKids((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    aria-label="Remove child"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
              <div>
                <Label>They call Mom</Label>
                <Input
                  value={kid.callsMom}
                  onChange={(event) =>
                    setKids((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, callsMom: event.target.value }
                          : item,
                      ),
                    )
                  }
                  placeholder="Mommy"
                />
              </div>
              <div>
                <Label>They call Dad</Label>
                <Input
                  value={kid.callsDad}
                  onChange={(event) =>
                    setKids((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, callsDad: event.target.value }
                          : item,
                      ),
                    )
                  }
                  placeholder="Daddy"
                />
              </div>
              <div className="sm:col-span-3">
                <Label>A little about them</Label>
                <Textarea
                  rows={2}
                  value={kid.favoriteThings}
                  onChange={(event) =>
                    setKids((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, favoriteThings: event.target.value }
                          : item,
                      ),
                    )
                  }
                  placeholder="Loves dinosaurs and pancakes. Shy at first."
                  required={index === 0}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-xl text-navy">
              Parents, grandparents, pets
            </h2>
            <p className="text-sm text-muted">
              Optional. Shared across every child&apos;s stories.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() =>
              setHousehold((current) => [...current, emptyMember()])
            }
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        <div className="space-y-4">
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
                  placeholder="Nana, Biscuit..."
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
                  placeholder="silver hair, floppy ears..."
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label>Species or breed (pets)</Label>
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
                    placeholder="golden retriever"
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
        </div>
      </section>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving your family..." : "Save family and continue"}
      </Button>
    </form>
  );
}
