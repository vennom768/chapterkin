"use client";

import { useState } from "react";
import { shareStory } from "@/lib/actions/story-sharing";

export function StoryShareControls({
  storyId,
  pdfHref,
  canShare,
}: {
  storyId: string;
  pdfHref: string;
  canShare: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
      <a
        href={pdfHref}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-gold/20"
      >
        Download PDF
      </a>
      {canShare ? (
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-gold/20"
          onClick={async () => {
            setError(null);
            try {
              const url = await shareStory(storyId);
              await navigator.clipboard.writeText(url);
              setCopied(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not share.");
            }
          }}
        >
          {copied ? "Link copied" : "Share link"}
        </button>
      ) : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
