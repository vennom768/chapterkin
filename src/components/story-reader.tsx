"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_EARLY_STEP,
  DEFAULT_READER_LEVEL,
  EARLY_STEPS,
  READER_LEVEL_STORAGE_KEY,
  READER_MODES,
  coerceReaderLevelId,
  isEarlyStepId,
  pickReaderText,
  readerModeId,
  type EarlyStepId,
  type ReaderLevelId,
  type ReaderTexts,
} from "@/lib/reader-levels";
import { cn } from "@/lib/utils";

type Page = {
  id: string;
  pageIndex: number;
  kind?: string | null;
  text: string;
  texts: ReaderTexts;
  imageStatus: string;
  imagePath: string | null;
};

export function StoryReader({
  storyId,
  title,
  childName,
  childId,
  seriesId,
  seriesTitle,
  chapterNumber,
  pages,
}: {
  storyId: string;
  title: string;
  childName: string;
  childId: string;
  seriesId?: string | null;
  seriesTitle?: string | null;
  chapterNumber?: number | null;
  pages: Page[];
}) {
  const [index, setIndex] = useState(0);
  const [readerLevel, setReaderLevel] = useState<ReaderLevelId>(DEFAULT_READER_LEVEL);
  const [earlyStep, setEarlyStep] = useState<EarlyStepId>(DEFAULT_EARLY_STEP);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [imageStatus, setImageStatus] = useState(
    Object.fromEntries(pages.map((page) => [page.id, page.imageStatus])),
  );

  useEffect(() => {
    const stored = coerceReaderLevelId(
      window.localStorage.getItem(READER_LEVEL_STORAGE_KEY),
    );
    if (!stored) return;
    setReaderLevel(stored);
    if (isEarlyStepId(stored)) {
      setEarlyStep(stored);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initiallyPending = pages.some((page) => page.imageStatus === "pending");
    if (!initiallyPending) {
      return;
    }

    void fetch(`/api/stories/${storyId}/illustrate`, { method: "POST" });

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/stories/${storyId}`);
      if (!response.ok || cancelled) {
        return;
      }
      const data = (await response.json()) as {
        pages: Array<{ id: string; imageStatus: string }>;
      };
      setImageStatus(
        Object.fromEntries(data.pages.map((page) => [page.id, page.imageStatus])),
      );
      if (data.pages.every((page) => page.imageStatus !== "pending")) {
        window.clearInterval(timer);
      }
    }, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pages, storyId]);

  const page = pages[index];
  if (!page) {
    return <p>This story does not have any pages yet.</p>;
  }

  const status = imageStatus[page.id] ?? page.imageStatus;
  const showImage = status === "ready" || page.imagePath;
  const isCover = page.kind === "cover";
  const storyPages = pages.filter((item) => item.kind !== "cover");
  const storyPageNumber = storyPages.findIndex((item) => item.id === page.id) + 1;

  const goBack = () => setIndex((value) => Math.max(0, value - 1));
  const goNext = () => setIndex((value) => Math.min(pages.length - 1, value + 1));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 text-center">
        {seriesTitle ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            {seriesTitle}
            {chapterNumber ? ` · Chapter ${chapterNumber}` : ""}
          </p>
        ) : null}
        {isCover ? (
          <h1 className="font-serif text-2xl text-navy sm:text-3xl md:text-4xl">
            A ChapterKin book
          </h1>
        ) : (
          <h1 className="font-serif text-2xl text-navy sm:text-3xl md:text-4xl">{title}</h1>
        )}
        <p className="mt-1 text-sm text-muted">A story for {childName}</p>
        <div className="mx-auto mt-4 max-w-lg">
          <p className="mb-2 text-sm font-semibold text-navy">Who is reading?</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {READER_MODES.map((mode) => {
              const selected = readerModeId(readerLevel) === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    const next = mode.id === "early" ? earlyStep : mode.id;
                    setReaderLevel(next);
                    window.localStorage.setItem(READER_LEVEL_STORAGE_KEY, next);
                  }}
                  className={cn(
                    "rounded-2xl border px-3 py-2.5 text-left transition-colors",
                    selected
                      ? "border-accent bg-gold/30 text-navy"
                      : "border-border bg-white text-navy hover:bg-gold/15",
                  )}
                >
                  <span className="block text-sm font-semibold">{mode.label}</span>
                  <span className="mt-0.5 block text-xs text-muted">{mode.blurb}</span>
                </button>
              );
            })}
          </div>
          {readerModeId(readerLevel) === "early" ? (
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-semibold text-navy">
                Learn-to-read step
              </p>
              <div className="grid grid-cols-3 gap-2">
                {EARLY_STEPS.map((step) => {
                  const selected = readerLevel === step.id;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => {
                        setEarlyStep(step.id);
                        setReaderLevel(step.id);
                        window.localStorage.setItem(READER_LEVEL_STORAGE_KEY, step.id);
                      }}
                      className={cn(
                        "rounded-2xl border px-2 py-2 text-center transition-colors",
                        selected
                          ? "border-accent bg-gold/30 text-navy"
                          : "border-border bg-white text-navy hover:bg-gold/15",
                      )}
                    >
                      <span className="block text-base font-semibold">{step.label}</span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-muted">
                        {step.blurb}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
        <Link
          href={`/stories/${storyId}/edit`}
          className="mt-2 inline-flex text-sm font-semibold text-accent"
        >
          Revise pages
        </Link>
      </div>

      <article
        className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-[0_18px_50px_-28px_rgba(44,24,16,0.55)] touch-pan-y sm:rounded-[2rem]"
        onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}
        onTouchEnd={(event) => {
          if (touchStartX == null) {
            return;
          }
          const delta = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
          if (delta > 50) {
            goBack();
          } else if (delta < -50) {
            goNext();
          }
          setTouchStartX(null);
        }}
      >
        <div className="aspect-square max-h-[min(100vw,52svh)] w-full bg-[#efe2cc] sm:max-h-none">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/pages/${page.id}/image`}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center px-6 text-center text-muted sm:px-8">
              {status === "failed"
                ? "We couldn't draw this page. The story is still ready to read."
                : "Painting this page..."}
            </div>
          )}
        </div>
        <div className="px-5 py-6 sm:px-6 sm:py-8 md:px-10">
          {isCover ? (
            <p className="font-serif text-2xl leading-8 text-navy sm:text-3xl">
              {title}
            </p>
          ) : (
            <p
              className={cn(
                "font-serif leading-8 text-foreground md:leading-9",
                readerLevel === "early1"
                  ? "text-2xl sm:text-3xl"
                  : readerLevel === "early2"
                    ? "text-xl sm:text-2xl md:text-3xl"
                    : "text-lg sm:text-xl md:text-2xl",
              )}
            >
              {pickReaderText(page.texts, readerLevel)}
            </p>
          )}
          <p className="mt-5 text-sm text-muted">
            {isCover
              ? "Cover"
              : `${
                  readerModeId(readerLevel) === "early"
                    ? `Learn to read · ${EARLY_STEPS.find((step) => step.id === readerLevel)?.step}`
                    : READER_MODES.find((mode) => mode.id === readerLevel)?.label
                } · Page ${storyPageNumber} of ${storyPages.length || pages.length}`}
          </p>
        </div>
      </article>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          disabled={index === 0}
          onClick={goBack}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        {index < pages.length - 1 ? (
          <Button className="w-full sm:w-auto" onClick={goNext}>
            {isCover ? "Open the book" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
            <Link
              href={`/stories/${storyId}/edit`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-gold/20"
            >
              Revise pages
            </Link>
            {seriesId ? (
              <Link
                href={`/stories/new?childId=${encodeURIComponent(childId)}&seriesId=${encodeURIComponent(seriesId)}`}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-gold/20"
              >
                Next chapter
              </Link>
            ) : null}
            <Link
              href="/library"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              Library
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
