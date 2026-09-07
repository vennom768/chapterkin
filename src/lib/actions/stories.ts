"use server";

import { after } from "next/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { illustrateStory } from "@/lib/ai/images";
import { checkPromptSafety } from "@/lib/ai/safety";
import { generateStoryText } from "@/lib/ai/stories";
import { getAgeBand } from "@/lib/age";
import { db } from "@/lib/db";
import { story, storyPage, storySeries } from "@/lib/db/schema";
import { assertCanGenerateStory } from "@/lib/billing";
import { getChildWithStoryCast } from "@/lib/queries/children";
import { requireUser } from "@/lib/session";
import { coverImagePrompt, storyName } from "@/lib/ai/character-bible";
import {
  DEFAULT_ILLUSTRATION_STYLE,
  isIllustrationStyleId,
} from "@/lib/illustration-styles";
import { createId } from "@/lib/utils";

const generateSchema = z.object({
  childId: z.string().min(1),
  mode: z.enum(["standalone", "series"]),
  seriesId: z.string().optional().nullable(),
  theme: z.string().max(40).optional().nullable(),
  dailyPrompt: z.string().max(500).optional().nullable(),
  illustrationStyle: z.string().max(40).optional().nullable(),
});

function emptyToNull(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function createStory(input: z.infer<typeof generateSchema>) {
  const user = await requireUser();
  try {
    await assertCanGenerateStory(user.id);
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Choose a plan to generate a story.",
    };
  }
  const parsed = generateSchema.parse({
    ...input,
    seriesId: emptyToNull(input.seriesId),
    theme: emptyToNull(input.theme),
    dailyPrompt: emptyToNull(input.dailyPrompt),
    illustrationStyle: emptyToNull(input.illustrationStyle),
  });

  const requestedStyle = parsed.illustrationStyle ?? DEFAULT_ILLUSTRATION_STYLE;
  const illustrationStyle = isIllustrationStyleId(requestedStyle)
    ? requestedStyle
    : DEFAULT_ILLUSTRATION_STYLE;

  const safety = await checkPromptSafety(parsed.dailyPrompt, parsed.theme);
  if (!safety.ok) {
    return { ok: false as const, error: safety.reason };
  }

  const profile = await getChildWithStoryCast(user.id, parsed.childId);
  if (!profile) {
    return { ok: false as const, error: "Choose a child first." };
  }

  let series =
    parsed.mode === "series" && parsed.seriesId
      ? (
          await db
            .select()
            .from(storySeries)
            .where(
              and(
                eq(storySeries.id, parsed.seriesId),
                eq(storySeries.userId, user.id),
                eq(storySeries.childId, parsed.childId),
              ),
            )
            .limit(1)
        )[0]
      : null;

  if (parsed.mode === "series" && parsed.seriesId && !series) {
    return { ok: false as const, error: "That series could not be found." };
  }

  let generated;
  try {
    generated = await generateStoryText({
      child: profile.child,
      characters: profile.characters,
      mode: parsed.mode,
      theme: parsed.theme,
      dailyPrompt: parsed.dailyPrompt,
      series,
      illustrationStyle,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Story generation failed.";
    return { ok: false as const, error: message };
  }

  const now = new Date();
  if (parsed.mode === "series" && !series) {
    const seriesId = createId();
    series = {
      id: seriesId,
      userId: user.id,
      childId: parsed.childId,
      title: generated.seriesTitle || generated.title,
      premise: generated.seriesSummary,
      runningSummary: generated.seriesSummary,
      lastChapterSynopsis: generated.synopsis,
      lastChapterNumber: 0,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(storySeries).values(series);
  }

  const chapterNumber = series ? series.lastChapterNumber + 1 : null;
  const storyId = createId();

  await db.insert(story).values({
    id: storyId,
    userId: user.id,
    childId: parsed.childId,
    seriesId: series?.id ?? null,
    mode: parsed.mode,
    title: generated.title,
    theme: parsed.theme,
    dailyPrompt: parsed.dailyPrompt,
    ageBand: getAgeBand(profile.child.age),
    chapterNumber,
    synopsis: generated.synopsis,
    illustrationStyle,
    status: "ready",
    createdAt: now,
  });

  const childName = storyName(profile.child);
  await db.insert(storyPage).values([
    {
      id: createId(),
      storyId,
      pageIndex: 0,
      kind: "cover",
      text: generated.title,
      imagePrompt: coverImagePrompt(generated.title, childName),
      imageStatus: "pending",
    },
    ...generated.pages.map((page, index) => ({
      id: createId(),
      storyId,
      pageIndex: index + 1,
      kind: "page",
      text: page.text,
      imagePrompt: page.imagePrompt,
      imageStatus: "pending",
    })),
  ]);

  if (series) {
    await db
      .update(storySeries)
      .set({
        title: generated.seriesTitle || series.title,
        runningSummary: generated.seriesSummary,
        lastChapterSynopsis: generated.synopsis,
        lastChapterNumber: chapterNumber ?? series.lastChapterNumber + 1,
        updatedAt: now,
      })
      .where(eq(storySeries.id, series.id));
  }

  after(async () => {
    await illustrateStory(storyId);
  });

  revalidatePath("/library");
  revalidatePath("/home");
  revalidatePath(`/stories/${storyId}`);

  return { ok: true as const, storyId };
}
