import { z } from "zod";
import { describeChildForStory } from "@/lib/ai/character-bible";
import { generateMockStory } from "@/lib/ai/mock-stories";
import { ollamaJsonChat } from "@/lib/ai/ollama";
import { storyTextModel } from "@/lib/ai/models";
import { getOpenAI } from "@/lib/ai/openai";
import { isLocalStoryProvider, isMockStoryProvider } from "@/lib/ai/provider";
import { getAgeGuidance } from "@/lib/age";
import { getIllustrationStyle } from "@/lib/illustration-styles";
import type { StoryPerson } from "@/lib/ai/character-bible";
import type { childProfile, storySeries } from "@/lib/db/schema";

const generatedStorySchema = z.object({
  title: z.string().min(1),
  seriesTitle: z.string().nullish(),
  synopsis: z.string().min(1),
  seriesSummary: z.string().min(1),
  pages: z
    .array(
      z.object({
        text: z.string().min(1),
        imagePrompt: z.string().min(1),
      }),
    )
    .min(6)
    .max(10),
});

export type GeneratedStory = z.infer<typeof generatedStorySchema>;

type Child = typeof childProfile.$inferSelect;
type Series = typeof storySeries.$inferSelect;

export type StoryGenerationInput = {
  child: Child;
  characters: StoryPerson[];
  mode: "standalone" | "series";
  theme?: string | null;
  dailyPrompt?: string | null;
  series?: Series | null;
  illustrationStyle?: string | null;
};

const SYSTEM_PROMPT = `You write original, kind bedtime stories for a parent to read aloud.

Hard rules:
- Age-appropriate language and plot only.
- Soft landing: the last page is calm, safe, and ready for sleep.
- No horror, jump scares, real-world violence, weapons, bullying as entertainment, or frightening villains.
- No lectures or moralizing speeches. Kindness can be shown, not preached.
- Call the child what the family calls them. Use that name in the story.
- If the parent listed what the child calls Mom or Dad (Mommy, Daddy, Mama, Papa, etc.), use those exact words.
- Use only the names and facts the parent provided. Do not invent extra siblings, grandparents, pets, or friends.
- If a daily moment is provided, weave it in naturally as part of the adventure. Do not paste it as a recap.
- Inclusive, warm, and respectful.
- Each page is a speak-aloud chunk, not a wall of text.
- Write 8 to 10 interior story pages. Do not write a cover page. The app adds a titled cover separately.
- imagePrompt describes one interior scene from the SAME picture book: same child, same clothes, same face, same art style. No text in the image.
- Return JSON only that matches the requested schema.`;

export async function generateStoryText(
  input: StoryGenerationInput,
): Promise<GeneratedStory> {
  if (isMockStoryProvider()) {
    return generateMockStory(input);
  }

  const guidance = getAgeGuidance(input.child.age, input.child.ageMonths);
  const style = getIllustrationStyle(input.illustrationStyle);

  const seriesBlock =
    input.mode === "series" && input.series
      ? `This is chapter ${(input.series.lastChapterNumber ?? 0) + 1} of the series "${input.series.title}".
Premise: ${input.series.premise ?? "Continue the established world."}
Running summary of the series so far:
${input.series.runningSummary || "This is the first chapter."}
Last chapter synopsis:
${input.series.lastChapterSynopsis || "None yet."}
Continue the same world and recurring characters. Advance the story; do not repeat the last night. End in a way that can continue another night, but still feel complete and bedtime-calm.
seriesTitle should match the existing series title unless a very small clarification is needed.
seriesSummary should be an updated running summary of the world, who appeared, and what is unresolved — not the full chapter.`
      : input.mode === "series"
        ? `This is the first chapter of a new series. Invent a gentle ongoing world.
seriesTitle should be a short series name a parent would recognize later.
seriesSummary should capture the world, who appeared, and a small thread that can continue.`
        : `This is a standalone story that is complete tonight.
Still include a short seriesSummary in case the parent later continues it, describing the world and ending.`;

  const userPrompt = `Write a bedtime story.

${describeChildForStory(input.child, input.characters)}

Age band: ${guidance.band}. ${guidance.tone}
Write ${guidance.pages.min}–${guidance.pages.max} interior pages (not including the cover).
About ${guidance.wordsPerPage.min}–${guidance.wordsPerPage.max} words per page.
Picture style for every page: ${style.name}. ${style.bible}

Theme (optional): ${input.theme || "parent did not pick a theme — choose something cozy and fitting."}
What happened today (optional): ${input.dailyPrompt || "none — invent a kind, original plot."}

${seriesBlock}

JSON fields:
- title: tonight's story or chapter title
- seriesTitle: series name if this is or could become a series
- synopsis: 2–4 sentences of what happened tonight
- seriesSummary: compact memory for a future chapter
- pages: array of { text, imagePrompt }`;

  let parsed: unknown;
  if (isLocalStoryProvider()) {
    parsed = await ollamaJsonChat(SYSTEM_PROMPT, userPrompt);
  } else {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: storyTextModel(),
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("The story model returned an empty response.");
    }
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("The story model returned invalid JSON.");
    }
  }

  const rawStory =
    parsed && typeof parsed === "object" && "pages" in parsed
      ? parsed
      : parsed && typeof parsed === "object" && "story" in parsed
        ? (parsed as { story: unknown }).story
        : parsed;
  const story = generatedStorySchema.parse(rawStory);
  const pageCount = story.pages.length;
  if (pageCount < guidance.pages.min) {
    // Accept slightly short books rather than failing the night.
    return story;
  }
  if (pageCount > guidance.pages.max) {
    return { ...story, pages: story.pages.slice(0, guidance.pages.max) };
  }
  return story;
}
