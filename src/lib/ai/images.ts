import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import {
  buildCharacterBible,
  coverImagePrompt,
  interiorImagePrompt,
  storyName,
} from "@/lib/ai/character-bible";
import { formatAgeForArt } from "@/lib/age";
import { generateLocalPng } from "@/lib/ai/local-images";
import { mockPageSvg } from "@/lib/ai/mock-images";
import { storyImageFallbackModel, storyImageModel } from "@/lib/ai/models";
import { getOpenAI } from "@/lib/ai/openai";
import { isLocalStoryProvider, isMockStoryProvider } from "@/lib/ai/provider";
import { db } from "@/lib/db";
import { story, storyPage } from "@/lib/db/schema";
import { getChildWithStoryCast } from "@/lib/queries/children";

const STORAGE_DIR = path.join(process.cwd(), "storage", "images");

function pagePrompt(
  bible: string,
  title: string,
  childName: string,
  ageForArt: string,
  page: { kind: string; imagePrompt: string; pageIndex: number },
) {
  const scene =
    page.kind === "cover"
      ? coverImagePrompt(title, childName, ageForArt)
      : interiorImagePrompt(page.imagePrompt, childName, ageForArt);
  return `${bible} ${scene} ${childName} is ${ageForArt} on this page too. This is page ${page.pageIndex + 1} of the same book.`;
}

async function imageBufferFromResult(result: {
  data?: Array<{ b64_json?: string | null; url?: string | null }> | null;
}) {
  const b64 = result.data?.[0]?.b64_json;
  if (b64) {
    return Buffer.from(b64, "base64");
  }
  const url = result.data?.[0]?.url;
  if (url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to download generated image");
    }
    return Buffer.from(await response.arrayBuffer());
  }
  return null;
}

async function generateImagePng(prompt: string): Promise<Buffer> {
  const openai = getOpenAI();
  const models = [storyImageModel(), storyImageFallbackModel()].filter(
    (model, index, list) => list.indexOf(model) === index,
  );

  let lastError: unknown;
  for (const model of models) {
    try {
      const result = await openai.images.generate({
        model,
        prompt,
        size: "1024x1024",
        quality: "medium",
      });
      const buffer = await imageBufferFromResult(result);
      if (buffer) {
        return buffer;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Image model did not return image data");
}

export async function illustrateStory(storyId: string, pageIds?: string[]) {
  const [current] = await db.select().from(story).where(eq(story.id, storyId)).limit(1);
  if (!current) {
    return;
  }

  const cast = await getChildWithStoryCast(current.userId, current.childId);
  if (!cast) {
    return;
  }

  const bible = buildCharacterBible(
    cast.child,
    cast.characters,
    current.illustrationStyle,
  );
  const pages = await db
    .select()
    .from(storyPage)
    .where(eq(storyPage.storyId, storyId));

  await mkdir(STORAGE_DIR, { recursive: true });

  const selected = new Set(pageIds ?? []);
  for (const page of pages.sort((a, b) => a.pageIndex - b.pageIndex)) {
    if (selected.size && !selected.has(page.id)) {
      continue;
    }
    if (!selected.size && page.imageStatus === "ready" && page.imagePath) {
      continue;
    }
    try {
      if (isMockStoryProvider()) {
        const filename = `${page.id}.svg`;
        const absolute = path.join(STORAGE_DIR, filename);
        await writeFile(
          absolute,
          mockPageSvg(
            page.kind === "cover" ? current.title : storyName(cast.child),
            page.pageIndex,
          ),
          "utf8",
        );
        await db
          .update(storyPage)
          .set({
            imagePath: filename,
            imageStatus: "ready",
          })
          .where(eq(storyPage.id, page.id));
        continue;
      }

      const prompt = pagePrompt(
        bible,
        current.title,
        storyName(cast.child),
        formatAgeForArt(cast.child.age, cast.child.ageMonths),
        page,
      );
      const png = isLocalStoryProvider()
        ? await generateLocalPng(prompt)
        : await generateImagePng(prompt);
      const filename = `${page.id}.png`;
      const absolute = path.join(STORAGE_DIR, filename);
      await writeFile(absolute, png);
      await db
        .update(storyPage)
        .set({
          imagePath: filename,
          imageStatus: "ready",
        })
        .where(eq(storyPage.id, page.id));
    } catch {
      await db
        .update(storyPage)
        .set({ imageStatus: "failed" })
        .where(eq(storyPage.id, page.id));
    }
  }
}
