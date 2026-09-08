"use client";

import { useState } from "react";
import {
  generateChildPortrait,
  selectChildPortrait,
  startPortraitPackCheckout,
} from "@/lib/actions/portraits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  portraitPackPriceLabel,
  portraitsRemaining,
} from "@/lib/portraits";
import { cn } from "@/lib/utils";

type Portrait = {
  id: string;
  imagePath: string;
  source: string;
};

export function PortraitStudio({
  childId,
  childName,
  selectedPortraitId,
  packs,
  portraits,
}: {
  childId: string;
  childName: string;
  selectedPortraitId?: string | null;
  packs: number;
  portraits: Portrait[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const remaining = portraitsRemaining(portraits.length, packs);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-navy">Draw {childName}</h2>
        <p className="mt-1 text-sm text-muted">
          Build from the look you already chose, or use a photo once. You get
          three drawings, then pick the one stories should use.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-gold/15 px-4 py-3 text-sm text-navy">
        <p className="font-semibold">Photos are temporary.</p>
        <p className="mt-1 text-muted">
          If you upload a picture, ChapterKin uses it only to draw this one
          portrait, then discards it. We do not store photos of your child. The
          drawing we keep is the storybook picture, not the photo.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setError(null);
          const formData = new FormData(event.currentTarget);
          formData.set("childId", childId);
          const photo = formData.get("photo");
          if (photo instanceof File && photo.size === 0) {
            formData.delete("photo");
          }
          try {
            const result = await generateChildPortrait(formData);
            if (!result.ok) {
              setError(result.error);
              if (result.redirectTo) {
                window.location.href = result.redirectTo;
              }
              return;
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not draw this picture.");
          } finally {
            setPending(false);
          }
        }}
      >
        <input type="hidden" name="childId" value={childId} />
        <div>
          <Label htmlFor="photo">Optional photo (used once, never stored)</Label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-1 block w-full text-sm text-navy file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy"
          />
        </div>
        <div>
          <Label htmlFor="note">What should this drawing change?</Label>
          <Textarea
            id="note"
            name="note"
            rows={2}
            placeholder="Curly hair. Freckles. Favorite yellow raincoat."
          />
        </div>
        {remaining > 0 ? (
          <Button type="submit" disabled={pending}>
            {pending
              ? "Drawing..."
              : portraits.length
                ? `Draw another (${remaining} left)`
                : "Draw my child"}
          </Button>
        ) : (
          <Button
            type="button"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              setError(null);
              const result = await startPortraitPackCheckout(childId);
              if (!result.ok) {
                setError(result.error);
                setPending(false);
                return;
              }
              window.location.href = result.url;
            }}
          >
            Get 3 more drawings · {portraitPackPriceLabel()}
          </Button>
        )}
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {portraits.length ? (
        <div>
          <p className="mb-3 text-sm font-semibold text-navy">
            Pick the drawing stories should use
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {portraits.map((portrait) => {
              const selected = selectedPortraitId === portrait.id;
              return (
                <button
                  key={portrait.id}
                  type="button"
                  onClick={() => selectChildPortrait(childId, portrait.id)}
                  className={cn(
                    "overflow-hidden rounded-2xl border text-left",
                    selected ? "border-accent ring-2 ring-accent" : "border-border",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/portraits/${portrait.id}/image`}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                  <p className="px-3 py-2 text-xs font-semibold text-navy">
                    {selected
                      ? "Using this one"
                      : portrait.source === "photo"
                        ? "From a photo"
                        : "From the look"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">
          No drawings yet. Generate the first one before you write a story.
        </p>
      )}
    </div>
  );
}
