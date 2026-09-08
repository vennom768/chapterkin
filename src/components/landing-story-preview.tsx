"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LandingStoryArt } from "@/components/landing-story-art";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SAMPLE_PAGES = [
  {
    id: "cover",
    kind: "cover" as const,
    title: "Maya and the Porch Light",
    parent: "",
    early1: "",
    growing: "",
  },
  {
    id: "page-1",
    kind: "page" as const,
    title: "Maya and the Porch Light",
    early1: "Maya puts on her coat.",
    parent:
      "Maya pulled on her yellow raincoat. Biscuit trotted beside her, ears flopping, as the two of them followed Nana's porch light through the gentle rain.",
    growing:
      "Maya buttoned her yellow raincoat and stepped into the soft rain. Biscuit trotted close, ears flopping, while Nana's porch light made a warm path home.",
  },
  {
    id: "page-2",
    kind: "page" as const,
    title: "Maya and the Porch Light",
    early1: "The light is on.",
    parent:
      "\"Almost home,\" whispered Maya. The porch light made a golden puddle on the wet stones, and Biscuit sat down as if the night had already begun to hush.",
    growing:
      "\"Almost home,\" Maya whispered, and the porch light pooled gold on the wet stones. Biscuit sat in that quiet shine, as if bedtime had already found them both.",
  },
] as const;

const LEVELS = [
  { id: "early1", label: "Learn to read", blurb: "First words" },
  { id: "parent", label: "Parent", blurb: "Read-aloud" },
  { id: "growing", label: "Growing", blurb: "Richer words" },
] as const;

type LevelId = (typeof LEVELS)[number]["id"];

export function LandingStoryPreview() {
  const [index, setIndex] = useState(0);
  const [level, setLevel] = useState<LevelId>("parent");
  const page = SAMPLE_PAGES[index];
  const isCover = page.kind === "cover";
  const text = isCover ? "" : page[level];

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_22px_60px_-30px_rgba(44,24,16,0.55)] sm:rounded-[2rem]">
      <div className="aspect-square max-h-[min(100vw,28rem)] w-full bg-[#efe2cc] sm:max-h-[32rem]">
        <LandingStoryArt />
      </div>
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        {isCover ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              A sample ChapterKin book
            </p>
            <p className="mt-2 font-serif text-2xl leading-8 text-navy sm:text-3xl">
              {page.title}
            </p>
            <p className="mt-2 text-sm text-muted">A story for Maya</p>
          </div>
        ) : (
          <p
            className={cn(
              "font-serif leading-8 text-foreground",
              level === "early1" ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl sm:leading-8",
            )}
          >
            {text}
          </p>
        )}
        <p className="mt-4 text-sm text-muted">
          {isCover
            ? "Cover"
            : `${LEVELS.find((item) => item.id === level)?.label} · Page ${index} of ${SAMPLE_PAGES.length - 1}`}
        </p>

        {isCover ? null : (
          <div className="mt-5 grid grid-cols-3 gap-2">
            {LEVELS.map((item) => {
              const selected = level === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLevel(item.id)}
                  className={cn(
                    "rounded-2xl border px-2 py-2 text-center transition-colors",
                    selected
                      ? "border-accent bg-gold/30 text-navy"
                      : "border-border bg-white text-navy hover:bg-gold/15",
                  )}
                >
                  <span className="block text-xs font-semibold sm:text-sm">{item.label}</span>
                  <span className="mt-0.5 block text-[11px] text-muted">{item.blurb}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={index === 0}
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={index === SAMPLE_PAGES.length - 1}
            onClick={() => setIndex((value) => Math.min(SAMPLE_PAGES.length - 1, value + 1))}
          >
            {isCover ? "Open the book" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
