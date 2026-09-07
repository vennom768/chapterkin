"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { startPageRevisionCheckout } from "@/lib/actions/revisions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice, PAGE_REVISION_CENTS, revisionPrice } from "@/lib/plans";
import { cn } from "@/lib/utils";

type EditorPage = {
  id: string;
  pageIndex: number;
  kind: string;
  text: string;
  imageStatus: string;
  imagePath: string | null;
};

export function StoryEditor({
  storyId,
  title,
  pages,
}: {
  storyId: string;
  title: string;
  pages: EditorPage[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [instruction, setInstruction] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = revisionPrice(selected.length);

  const labels = useMemo(
    () =>
      Object.fromEntries(
        pages.map((page) => [
          page.id,
          page.kind === "cover"
            ? "Cover"
            : `Page ${pages.filter((item) => item.kind !== "cover").findIndex((item) => item.id === page.id) + 1}`,
        ]),
      ),
    [pages],
  );

  return (
    <form
      className="space-y-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const result = await startPageRevisionCheckout({
          storyId,
          pageIds: selected,
          instruction,
        });
        if (!result.ok) {
          if (result.redirectTo) {
            router.push(result.redirectTo);
            return;
          }
          setError(result.error);
          setPending(false);
          return;
        }
        window.location.assign(result.url);
      }}
    >
      <p className="text-sm text-muted">
        Choose the pages you want rewritten and redrawn. Revisions cost{" "}
        {formatPrice(PAGE_REVISION_CENTS)} per page and do not use a story from
        your monthly plan.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {pages.map((page) => {
          const checked = selected.includes(page.id);
          return (
            <button
              key={page.id}
              type="button"
              onClick={() =>
                setSelected((current) =>
                  checked
                    ? current.filter((id) => id !== page.id)
                    : [...current, page.id],
                )
              }
              className={cn(
                "overflow-hidden rounded-3xl border text-left transition-colors",
                checked ? "border-accent bg-gold/20" : "border-border bg-white",
              )}
            >
              <div className="aspect-[4/3] bg-[#efe2cc]">
                {page.imageStatus === "ready" && page.imagePath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/pages/${page.id}/image`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center px-4 text-sm text-muted">
                    {labels[page.id]}
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {labels[page.id]}
                  {checked ? " · selected" : ""}
                </p>
                <p className="mt-1 line-clamp-3 text-sm text-navy">
                  {page.kind === "cover" ? title : page.text}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      <div>
        <Label htmlFor="instruction">What should change?</Label>
        <Textarea
          id="instruction"
          rows={4}
          required
          minLength={4}
          value={instruction}
          onChange={(event) => setInstruction(event.target.value)}
          placeholder="These two pages feel too loud. Make them quieter and keep the puppy on the bed."
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" disabled={pending || selected.length === 0}>
        {pending
          ? "Opening checkout..."
          : selected.length === 0
            ? "Select pages to revise"
            : `Revise ${selected.length} page${selected.length === 1 ? "" : "s"} for ${formatPrice(total)}`}
      </Button>
    </form>
  );
}
