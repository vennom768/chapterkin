"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createStory } from "@/lib/actions/stories";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const THEMES = [
  { value: "", label: "Let the story decide" },
  { value: "cozy", label: "Cozy" },
  { value: "adventure", label: "Adventure" },
  { value: "silly", label: "Silly" },
  { value: "nature", label: "Nature" },
  { value: "friendship", label: "Friendship" },
  { value: "bedtime", label: "Bedtime" },
];

type ChildOption = { id: string; name: string; age: number };
type SeriesOption = { id: string; title: string; childId: string };

export function StoryComposer({
  childrenOptions,
  seriesOptions,
  defaultChildId,
  defaultSeriesId,
  lockChild = false,
}: {
  childrenOptions: ChildOption[];
  seriesOptions: SeriesOption[];
  defaultChildId?: string;
  defaultSeriesId?: string;
  lockChild?: boolean;
}) {
  const router = useRouter();
  const [childId, setChildId] = useState(
    defaultChildId ?? childrenOptions[0]?.id ?? "",
  );
  const [mode, setMode] = useState<"standalone" | "series">(
    defaultSeriesId ? "series" : "standalone",
  );
  const [seriesId, setSeriesId] = useState(defaultSeriesId ?? "");
  const [theme, setTheme] = useState("");
  const [dailyPrompt, setDailyPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const childSeries = useMemo(
    () => seriesOptions.filter((series) => series.childId === childId),
    [seriesOptions, childId],
  );

  return (
    <form
      className="space-y-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const result = await createStory({
          childId,
          mode,
          seriesId: mode === "series" ? seriesId || null : null,
          theme,
          dailyPrompt,
        });
        if (!result.ok) {
          setError(result.error);
          setPending(false);
          return;
        }
        router.push(`/stories/${result.storyId}`);
        router.refresh();
      }}
    >
      {lockChild ? (
        <input type="hidden" name="childId" value={childId} />
      ) : (
        <div>
          <Label htmlFor="childId">Who is this story for?</Label>
          <select
            id="childId"
            className="min-h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base"
            value={childId}
            onChange={(event) => {
              setChildId(event.target.value);
              setSeriesId("");
            }}
            required
          >
            {childrenOptions.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}, {child.age}
              </option>
            ))}
          </select>
        </div>
      )}

      <fieldset className="space-y-2">
        <legend className="mb-1.5 text-sm font-semibold text-navy">
          Tonight&apos;s story
        </legend>
        <label className="flex min-h-14 items-start gap-3 rounded-2xl border border-border bg-white p-3">
          <input
            type="radio"
            name="mode"
            checked={mode === "standalone"}
            onChange={() => setMode("standalone")}
            className="mt-1 h-5 w-5"
          />
          <span>
            <span className="block font-semibold">Tonight only</span>
            <span className="text-sm text-muted">
              A complete story that does not need last night.
            </span>
          </span>
        </label>
        <label className="flex min-h-14 items-start gap-3 rounded-2xl border border-border bg-white p-3">
          <input
            type="radio"
            name="mode"
            checked={mode === "series"}
            onChange={() => setMode("series")}
            className="mt-1 h-5 w-5"
          />
          <span>
            <span className="block font-semibold">Part of a series</span>
            <span className="text-sm text-muted">
              Start a new world, or continue one you already began.
            </span>
          </span>
        </label>
      </fieldset>

      {mode === "series" ? (
        <div>
          <Label htmlFor="seriesId">Series</Label>
          <select
            id="seriesId"
            className="min-h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base"
            value={seriesId}
            onChange={(event) => setSeriesId(event.target.value)}
          >
            <option value="">Start a new series</option>
            {childSeries.map((series) => (
              <option key={series.id} value={series.id}>
                {series.title}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <Label htmlFor="theme">Theme</Label>
        <select
          id="theme"
          className="min-h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base"
          value={theme}
          onChange={(event) => setTheme(event.target.value)}
        >
          {THEMES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="dailyPrompt">Something from today</Label>
        <Textarea
          id="dailyPrompt"
          rows={4}
          value={dailyPrompt}
          onChange={(event) => setDailyPrompt(event.target.value)}
          placeholder="We visited Nana. The dog hid under the table during a thunderstorm. Maya lost a tooth."
        />
        <p className="mt-1 text-xs text-muted">
          Optional. We&apos;ll weave it in naturally if you add it.
        </p>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <Button type="submit" disabled={pending || !childId} className="w-full sm:w-auto">
        {pending ? "Writing tonight's story..." : "Generate story"}
      </Button>
    </form>
  );
}
