import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { storyName } from "@/lib/ai/character-bible";
import { generateLocalPng } from "@/lib/ai/local-images";
import { mockPageSvg } from "@/lib/ai/mock-images";
import { getOpenAI } from "@/lib/ai/openai";
import { isLocalStoryProvider, isMockStoryProvider } from "@/lib/ai/provider";
import { db } from "@/lib/db";
import { story, storyPage } from "@/lib/db/schema";
import { getChildWithStoryCast } from "@/lib/queries/children";

const STORAGE_DIR = path.join(process.cwd(), "storage", "images");

function imagePrompt(
  childName: string,
  appearance: string,
  scene: string,
) {
  return [childName, appearance, scene].filter(Boolean).join(", ");
}

async function generateImagePng(prompt: string): Promise<Buffer> {
  const openai = getOpenAI();

  try {
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });
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
  } catch {
    const fallback = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
    });
    const b64 = fallback.data?.[0]?.b64_json;
    if (b64) {
      return Buffer.from(b64, "base64");
    }
  }

  throw new Error("Image model did not return image data");
}

export async function illustrateStory(storyId: string) {
  const [current] = await db.select().from(story).where(eq(story.id, storyId)).limit(1);
  if (!current) {
    return;
  }

  const cast = await getChildWithStoryCast(current.userId, current.childId);
  if (!cast) {
    return;
  }

  const appearance = [
    cast.child.hair,
    cast.child.eyes,
    cast.child.skin,
    cast.child.usualClothes,
  ]
    .filter(Boolean)
    .join(", ");
  const pages = await db
    .select()
    .from(storyPage)
    .where(eq(storyPage.storyId, storyId));

  await mkdir(STORAGE_DIR, { recursive: true });

  for (const page of pages.sort((a, b) => a.pageIndex - b.pageIndex)) {
    if (page.imageStatus === "ready" && page.imagePath) {
      continue;
    }
    try {
      if (isMockStoryProvider()) {
        const filename = `${page.id}.svg`;
        const absolute = path.join(STORAGE_DIR, filename);
        await writeFile(
          absolute,
          mockPageSvg(storyName(cast.child), page.pageIndex),
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

      const prompt = imagePrompt(
        storyName(cast.child),
        appearance,
        page.imagePrompt,
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
