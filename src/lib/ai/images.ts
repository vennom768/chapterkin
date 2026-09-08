import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import {
  buildCharacterBible,
  coverImagePrompt,
  interiorImagePrompt,
  storyName,
} from "@/lib/ai/character-bible";
import { generateImagePng } from "@/lib/ai/image-generate";
import { generateLocalPng } from "@/lib/ai/local-images";
import { mockPageSvg } from "@/lib/ai/mock-images";
import { storageImagePath } from "@/lib/ai/portraits";
import { isLocalStoryProvider, isMockStoryProvider } from "@/lib/ai/provider";
import { formatAgeForArt } from "@/lib/age";
import { db } from "@/lib/db";
import { childPortrait, story, storyPage } from "@/lib/db/schema";
import { getChildWithStoryCast } from "@/lib/queries/children";

const STORAGE_DIR = path.join(process.cwd(), "storage", "images");

function pagePrompt(
  bible: string,
  title: string,
  childName: string,
  ageForArt: string,
  page: { kind: string; imagePrompt: string; pageIndex: number },
  hasPortrait: boolean,
) {
  const scene =
    page.kind === "cover"
      ? coverImagePrompt(title, childName, ageForArt)
      : interiorImagePrompt(page.imagePrompt, childName, ageForArt);
  const likeness = hasPortrait
    ? ` The attached image is the official ChapterKin drawing of ${childName}. Keep that exact face, hair, skin, and age in this scene.`
    : "";
  return `${bible} ${scene} ${childName} is ${ageForArt} on this page too. This is page ${page.pageIndex + 1} of the same book.${likeness}`;
}

async function loadSelectedPortrait(childId: string, selectedPortraitId?: string | null) {
  if (!selectedPortraitId) return null;
  const [portrait] = await db
    .select()
    .from(childPortrait)
    .where(eq(childPortrait.id, selectedPortraitId))
    .limit(1);
  if (!portrait || portrait.childId !== childId || !portrait.imagePath) {
    return null;
  }
  try {
    const buffer = await readFile(storageImagePath(portrait.imagePath));
    return {
      buffer,
      mime: portrait.imagePath.endsWith(".svg") ? "image/svg+xml" : "image/png",
      filename: path.basename(portrait.imagePath),
    };
  } catch {
    return null;
  }
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
  const portrait = await loadSelectedPortrait(
    cast.child.id,
    cast.child.selectedPortraitId,
  );

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
        Boolean(portrait),
      );
      const png = isLocalStoryProvider()
        ? await generateLocalPng(prompt)
        : await generateImagePng(prompt, portrait ?? undefined);
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
