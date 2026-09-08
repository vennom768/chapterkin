import { z } from "zod";
import { storyTextModel } from "@/lib/ai/models";
import { getOpenAI } from "@/lib/ai/openai";
import { ollamaJsonChat } from "@/lib/ai/ollama";
import { isLocalStoryProvider, isMockStoryProvider } from "@/lib/ai/provider";
import {
  fallbackReaderLevelVariants,
  parseTextLevels,
  readerLevelsAreDistinct,
} from "@/lib/reader-levels";

const variantsSchema = z.object({
  pages: z.array(
    z.object({
      textEarly1: z.string().min(1).optional(),
      text_early_1: z.string().min(1).optional(),
      early1: z.string().min(1).optional(),
      textEarly2: z.string().min(1).optional(),
      text_early_2: z.string().min(1).optional(),
      early2: z.string().min(1).optional(),
      textEarly3: z.string().min(1).optional(),
      text_early_3: z.string().min(1).optional(),
      early3: z.string().min(1).optional(),
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

  const system = `You rewrite bedtime-story pages into other reading levels.
Keep the same people, names, facts, and ending. Do not add or drop events.
textEarly1 is for a first-time reader: 1 very short sentence, 3-6 easy words, mostly 1 syllable.
textEarly2 is a small step up: 1-2 short sentences, still easy words, clearly longer than textEarly1.
textEarly3 is a child almost reading the full page: 2-4 simple sentences, same facts, shorter words, clearly shorter and simpler than the parent page. It must not copy the parent page.
textGrowing is for practice: longer sentences, richer verbs and feelings, at least one extra clause.
textGrowing must be clearly longer and more complex than the parent page.
textEarly1, textEarly2, and textEarly3 must not copy the parent page or each other.
Return JSON only: { pages: [{ textEarly1, textEarly2, textEarly3, textGrowing }] } in the same order.`;

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
    const fallback = fallbackReaderLevelVariants(text);
    const textEarly1 = firstText(row.textEarly1, row.text_early_1, row.early1, row.textEarly, row.text_early, row.early);
    const textEarly2 = firstText(row.textEarly2, row.text_early_2, row.early2);
    const textEarly3 = firstText(row.textEarly3, row.text_early_3, row.early3);
    const textGrowing = firstText(row.textGrowing, row.text_growing, row.growing);
    if (
      !readerLevelsAreDistinct(text, {
        early1: textEarly1,
        early2: textEarly2,
        early3: textEarly3,
        growing: textGrowing,
      })
    ) {
      return fallback;
    }
    return {
      textEarly1,
      textEarly2,
      textEarly3: textEarly3 || fallback.textEarly3,
      textGrowing,
      textEarly: textEarly1,
    };
  });
}

export async function attachReaderLevelVariants<
  T extends {
    text: string;
    textEarly?: string | null;
    textEarly1?: string | null;
    textEarly2?: string | null;
    textEarly3?: string | null;
    textGrowing?: string | null;
  },
>(pages: T[]) {
  const alreadyDistinct = pages.every((page) =>
    readerLevelsAreDistinct(page.text, {
      early1: page.textEarly1 || page.textEarly || undefined,
      early2: page.textEarly2 || undefined,
      early3: page.textEarly3 || undefined,
      growing: page.textGrowing || undefined,
    }),
  );
  if (alreadyDistinct) {
    return pages;
  }

  const variants = await generateReaderLevelVariants(pages.map((page) => page.text));
  return pages.map((page, index) => ({
    ...page,
    textEarly: variants[index]?.textEarly1 ?? page.textEarly ?? page.text,
    textEarly1: variants[index]?.textEarly1 ?? page.textEarly1 ?? page.textEarly ?? page.text,
    textEarly2: variants[index]?.textEarly2 ?? page.textEarly2 ?? page.text,
    textEarly3: variants[index]?.textEarly3 ?? page.textEarly3 ?? page.text,
    textGrowing: variants[index]?.textGrowing ?? page.textGrowing ?? page.text,
  }));
}
