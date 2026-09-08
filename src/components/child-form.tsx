"use client";

import { useState } from "react";
import { saveChild } from "@/lib/actions/children";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AgeFields } from "@/components/age-fields";
import { LookBuilder } from "@/components/look-builder";
import { Textarea } from "@/components/ui/textarea";

export function ChildForm({
  child,
}: {
  child?: {
    id: string;
    name: string;
    calledBy: string;
    age: number;
    ageMonths?: number | null;
    hair: string | null;
    eyes: string | null;
    skin: string | null;
    usualClothes: string | null;
    favoriteThings: string | null;
    callsMom: string | null;
    callsDad: string | null;
    notes: string | null;
  };
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [age, setAge] = useState(String(child?.age ?? 5));
  const [ageMonths, setAgeMonths] = useState(String(child?.ageMonths ?? 0));

  return (
    <form
      className="space-y-8"
      action={async (formData) => {
        setPending(true);
        setError(null);
        try {
          await saveChild(formData);
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
            err instanceof Error ? err.message : "Could not save this profile.",
          );
          setPending(false);
        }
      }}
    >
      {child ? <input type="hidden" name="id" value={child.id} /> : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={child?.name}
            placeholder="Maya"
          />
        </div>
        <div>
          <Label htmlFor="calledBy">What you call them</Label>
          <Input
            id="calledBy"
            name="calledBy"
            required
            defaultValue={child?.calledBy}
            placeholder="May-May, buddy, little bear..."
          />
          <p className="mt-1 text-xs text-muted">
            Stories will use this name.
          </p>
        </div>
        <div className="sm:col-span-2">
          <AgeFields
            age={age}
            ageMonths={ageMonths}
            onAgeChange={setAge}
            onMonthsChange={setAgeMonths}
          />
          <input type="hidden" name="age" value={age} />
          <input type="hidden" name="ageMonths" value={Number(age) < 1 ? ageMonths : ""} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="font-serif text-xl text-navy">What they call their parents</h2>
          <p className="mb-3 mt-1 text-sm text-muted">
            Mommy, Mom, Mama, Daddy, Dad, Papa — whatever they actually say.
          </p>
        </div>
        <div>
          <Label htmlFor="callsMom">Mom</Label>
          <Input
            id="callsMom"
            name="callsMom"
            defaultValue={child?.callsMom ?? ""}
            placeholder="Mommy"
          />
        </div>
        <div>
          <Label htmlFor="callsDad">Dad</Label>
          <Input
            id="callsDad"
            name="callsDad"
            defaultValue={child?.callsDad ?? ""}
            placeholder="Daddy"
          />
        </div>
      </section>

      <section>
        <Label htmlFor="favoriteThings">A little about them</Label>
        <Textarea
          id="favoriteThings"
          name="favoriteThings"
          rows={3}
          required
          minLength={2}
          defaultValue={child?.favoriteThings ?? ""}
          placeholder="Loves dinosaurs and pancakes. A little shy at first. Always wants to help in the kitchen."
        />
      </section>

      <section>
        <h2 className="font-serif text-xl text-navy">Build how they look</h2>
        <p className="mb-4 mt-1 text-sm text-muted">
          Tap face, hair, eyes, and clothes like an avatar. After you save,
          you&apos;ll draw a storybook picture of them and can iterate before
          any story is written.
        </p>
        <LookBuilder
          hair={child?.hair}
          eyes={child?.eyes}
          skin={child?.skin}
          usualClothes={child?.usualClothes}
        />
      </section>

      <section>
        <Label htmlFor="notes">Anything else</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={child?.notes ?? ""}
          placeholder="Optional extra details for later stories."
        />
      </section>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : child ? "Save profile" : "Add child"}
      </Button>
    </form>
  );
}
