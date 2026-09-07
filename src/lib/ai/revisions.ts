import { z } from "zod";
import { storyTextModel } from "@/lib/ai/models";
import { getOpenAI } from "@/lib/ai/openai";
import { isLocalStoryProvider, isMockStoryProvider } from "@/lib/ai/provider";
import { ollamaJsonChat } from "@/lib/ai/ollama";

const revisedPagesSchema = z.object({
  pages: z.array(
    z.object({
      pageId: z.string().min(1),
      text: z.string().min(1),
      imagePrompt: z.string().min(1),
    }),
  ),
});

export async function generateRevisedPages(input: {
  title: string;
  childName: string;
  instruction: string;
  pages: Array<{ id: string; pageIndex: number; kind: string; text: string }>;
  selectedIds: string[];
}) {
  const selected = input.pages.filter((page) => input.selectedIds.includes(page.id));
  const book = input.pages
    .map((page) => {
      const mark = input.selectedIds.includes(page.id) ? " [REVISE THIS PAGE]" : "";
      const label = page.kind === "cover" ? "Cover" : `Page ${page.pageIndex}`;
      return `${label}${mark}: ${page.text}`;
    })
    .join("\n\n");

  const system = `You revise selected pages of an existing children's bedtime picture book.
Keep the rest of the book consistent. Soft, kind, bedtime-safe language.
If a selected page is the cover, keep the painted-title idea in imagePrompt and use the requested title change in text if the parent asked for one.
imagePrompt describes one interior or cover scene with no extra captions except a cover title.
Return JSON only: { pages: [{ pageId, text, imagePrompt }] } for the selected pages only.`;

  const user = `Book title: ${input.title}
Child: ${input.childName}
Parent revision notes: ${input.instruction}

Full book:
${book}

Revise only these page ids: ${selected.map((page) => page.id).join(", ")}.`;

  if (isMockStoryProvider()) {
    return selected.map((page) => ({
      pageId: page.id,
      text: page.kind === "cover" ? input.title : `${page.text} The night felt even cozier.`,
      imagePrompt: page.text,
    }));
  }

  let parsed: unknown;
  if (isLocalStoryProvider()) {
    parsed = await ollamaJsonChat(system, user);
  } else {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: storyTextModel(),
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("The revision model returned an empty response.");
    }
    parsed = JSON.parse(raw);
  }

  const result = revisedPagesSchema.parse(parsed);
  const allowed = new Set(input.selectedIds);
  return result.pages.filter((page) => allowed.has(page.pageId));
}
