"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveChild } from "@/lib/actions/children";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AgeFields } from "@/components/age-fields";
import { ChildSexFields } from "@/components/child-sex-fields";
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
    sex?: string | null;
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
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [age, setAge] = useState(String(child?.age ?? 5));
  const [ageMonths, setAgeMonths] = useState(String(child?.ageMonths ?? 0));

  return (
    <form
      className="space-y-8"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.reportValidity()) {
          return;
        }
        setPending(true);
        setError(null);
        const formData = new FormData(form);
        const photo = formData.get("photo");
        formData.delete("photo");
        const photoFile = photo instanceof File && photo.size > 0 ? photo : null;
        try {
          const result = await saveChild(formData);
          if (!result.ok) {
            if (result.redirectTo) {
              router.push(result.redirectTo);
              return;
            }
            setError(result.error);
            setPending(false);
            return;
          }
          if (result.created) {
            const portraits = new FormData();
            if (photoFile) {
              portraits.set("photo", photoFile);
            }
            void fetch(`/api/children/${result.childId}/portraits`, {
              method: "POST",
              body: portraits,
            });
            router.push(`/children/${result.childId}/portrait?drawing=1`);
          } else {
            router.push(`/children/${result.childId}`);
          }
          router.refresh();
        } catch (err) {
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
        <div className="sm:col-span-2">
          <ChildSexFields value={child?.sex} />
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
          Tap face, hair, eyes, and clothes. You can also add a photo if you
          want. When you save, we draw three storybook pictures and you pick
          the one stories should use.
        </p>
        <LookBuilder
          hair={child?.hair}
          eyes={child?.eyes}
          skin={child?.skin}
          usualClothes={child?.usualClothes}
        />
        {child ? null : (
          <div className="mt-6 space-y-3">
            <div>
              <Label htmlFor="photo">Optional photo</Label>
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="mt-1 block w-full text-sm text-navy file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy"
              />
            </div>
            <div className="rounded-2xl border border-border bg-gold/15 px-4 py-3 text-sm text-navy">
              <p className="font-semibold">Photos are temporary.</p>
              <p className="mt-1 text-muted">
                We use a photo only to draw these three pictures, then discard
                it. We do not store photos of your child.
              </p>
            </div>
          </div>
        )}
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
        {pending ? "Saving..." : child ? "Save profile" : "Save and draw three pictures"}
      </Button>
    </form>
  );
}
