import { z } from "zod";
import { storyTextModel } from "@/lib/ai/models";
import { getOpenAI } from "@/lib/ai/openai";
import { ollamaJsonChat } from "@/lib/ai/ollama";
import { isLocalStoryProvider, isMockStoryProvider } from "@/lib/ai/provider";
import {
  fallbackReaderLevelVariants,
  normalizeGeneratedPageLevels,
  parseTextLevels,
  readerLevelsAreDistinct,
} from "@/lib/reader-levels";

const variantsSchema = z.object({
  pages: z.array(
    z.object({
      textEarly: z.string().min(1).optional(),
      text_early: z.string().min(1).optional(),
      early: z.string().min(1).optional(),
      textGrowing: z.string().min(1).optional(),
      text_growing: z.string().min(1).optional(),
      growing: z.string().min(1).optional(),
    }),
  ),
});

function firstText(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (value?.trim()) return value.trim();
  }
  return "";
}

export function pageHasDistinctLevels(page: {
  text: string;
  textLevels?: string | null;
}) {
  const stored = parseTextLevels(page.textLevels);
  return readerLevelsAreDistinct(page.text, stored);
}

export async function generateReaderLevelVariants(pages: string[]) {
  if (pages.length === 0) return [];
  if (isMockStoryProvider()) {
    return pages.map((text) => fallbackReaderLevelVariants(text));
  }

  const system = `You rewrite bedtime-story pages into two other reading levels.
Keep the same people, names, facts, and ending. Do not add or drop events.
textEarly is for a child learning to read: 1 short sentence, 6-12 easy words, mostly 1 syllable.
textGrowing is for practice: longer sentences, richer verbs and feelings, at least one extra clause.
textGrowing must be clearly longer and more complex than the parent page.
textEarly must be clearly shorter and simpler than the parent page.
Never copy the parent page. The three versions must not match.
Return JSON only: { pages: [{ textEarly, textGrowing }] } in the same order.`;

  const user = `Parent pages:\n${pages
    .map((text, index) => `${index + 1}. ${text}`)
    .join("\n\n")}`;

  let parsed: unknown;
  if (isLocalStoryProvider()) {
    parsed = await ollamaJsonChat(system, user);
  } else {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: storyTextModel(),
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("The reader-level model returned an empty response.");
    }
    parsed = JSON.parse(raw);
  }

  const result = variantsSchema.parse(parsed);
  return pages.map((text, index) => {
    const row = result.pages[index] ?? {};
    const textEarly = firstText(row.textEarly, row.text_early, row.early);
    const textGrowing = firstText(row.textGrowing, row.text_growing, row.growing);
    if (!readerLevelsAreDistinct(text, { early: textEarly, growing: textGrowing })) {
      return fallbackReaderLevelVariants(text);
    }
    return { textEarly, textGrowing };
  });
}

export async function attachReaderLevelVariants<
  T extends { text: string; textEarly?: string | null; textGrowing?: string | null },
>(pages: T[]) {
  const alreadyDistinct = pages.every((page) => {
    const levels = normalizeGeneratedPageLevels({
      text: page.text,
      textEarly: page.textEarly,
      textGrowing: page.textGrowing,
    });
    return pageHasDistinctLevels({
      text: levels.text,
      textLevels: levels.textLevels,
    });
  });
  if (alreadyDistinct) {
    return pages;
  }

  const variants = await generateReaderLevelVariants(pages.map((page) => page.text));
  return pages.map((page, index) => ({
    ...page,
    textEarly: variants[index]?.textEarly ?? page.textEarly ?? page.text,
    textGrowing: variants[index]?.textGrowing ?? page.textGrowing ?? page.text,
  }));
}
