"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { selectChildPortrait, startPortraitPackCheckout } from "@/lib/actions/portraits";
import { Button } from "@/components/ui/button";
import { portraitPackPriceLabel, portraitsRemaining } from "@/lib/portraits";
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
  drawing: startDrawing = false,
}: {
  childId: string;
  childName: string;
  selectedPortraitId?: string | null;
  packs: number;
  portraits: Portrait[];
  drawing?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [waiting, setWaiting] = useState(startDrawing);
  const remaining = portraitsRemaining(portraits.length, packs);

  async function drawThreePictures() {
    setPending(true);
    setWaiting(true);
    setError(null);
    try {
      const response = await fetch(`/api/children/${childId}/portraits`, {
        method: "POST",
        body: new FormData(),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Could not draw these pictures. Try again in a moment.");
        setWaiting(false);
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draw these pictures.");
      setWaiting(false);
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (portraits.length > 0) {
      setWaiting(false);
      return;
    }
    if (!waiting) {
      return;
    }
    const interval = window.setInterval(() => {
      router.refresh();
    }, 2000);
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      setWaiting(false);
      setError((current) => current ?? "Those pictures are taking too long. Try again.");
    }, 180000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [portraits.length, router, waiting]);

  const drawing = pending || (waiting && portraits.length === 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-navy">Pick {childName}&apos;s drawing</h2>
        <p className="mt-1 text-sm text-muted">
          Stories will use the picture you pick. You can buy three more later if
          none of these feel right.
        </p>
      </div>

      {portraits.length ? (
        <div>
          <p className="mb-3 text-sm font-semibold text-navy">
            Tap the one stories should use
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
                    {selected ? "Using this one" : "Use this one"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            {drawing
              ? "Drawing three storybook pictures. This usually takes about a minute."
              : "We don't have drawings yet. We can make three from the look you built."}
          </p>
          <Button type="button" disabled={drawing} onClick={() => void drawThreePictures()}>
            {drawing ? "Drawing three pictures..." : "Draw three pictures"}
          </Button>
        </div>
      )}

      {selectedPortraitId ? (
        <Link
          href={`/stories/new?childId=${childId}`}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          Write a story
        </Link>
      ) : null}

      {portraits.length > 0 && remaining <= 0 ? (
        <Button
          type="button"
          variant="secondary"
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
      ) : null}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
