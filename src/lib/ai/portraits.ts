import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { childAppearanceLine, storyName } from "@/lib/ai/character-bible";
import { generateImagePng, type ImageReference } from "@/lib/ai/image-generate";
import { generateLocalPng } from "@/lib/ai/local-images";
import { mockPageSvg } from "@/lib/ai/mock-images";
import { isLocalStoryProvider, isMockStoryProvider } from "@/lib/ai/provider";
import { formatAgeForArt } from "@/lib/age";
import type { childProfile } from "@/lib/db/schema";

const STORAGE_DIR = path.join(process.cwd(), "storage", "images");

type Child = typeof childProfile.$inferSelect;

export function childPortraitPrompt(
  child: Child,
  note?: string | null,
  fromPhoto = false,
) {
  const name = storyName(child);
  const age = formatAgeForArt(child.age, child.ageMonths);
  const look = childAppearanceLine(child);
  const photoRule = fromPhoto
    ? "Use the attached parent photo only as a one-time likeness reference. Draw a children's picture-book portrait, not a photograph. Do not reproduce the photo. Discard the photo after this drawing."
    : "Draw from the written look only. No photograph was provided.";
  return [
    `Square children's picture-book portrait of ${name}, who is ${age}.`,
    look ? `Look: ${look}.` : "",
    "Soft watercolor storybook art, cream background, facing the camera, kind expression, not photorealistic, no text, no watermark.",
    photoRule,
    note ? `Parent revision note: ${note}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export async function generateChildPortraitPng(
  child: Child,
  input?: { note?: string | null; photo?: ImageReference },
) {
  const prompt = childPortraitPrompt(child, input?.note, Boolean(input?.photo));
  if (isMockStoryProvider()) {
    return Buffer.from(mockPageSvg(storyName(child), 0), "utf8");
  }
  if (isLocalStoryProvider()) {
    return generateLocalPng(prompt);
  }
  return generateImagePng(prompt, input?.photo);
}

export async function writePortraitFile(portraitId: string, png: Buffer, mock = false) {
  await mkdir(STORAGE_DIR, { recursive: true });
  const filename = mock ? `portrait-${portraitId}.svg` : `portrait-${portraitId}.png`;
  await writeFile(path.join(STORAGE_DIR, filename), png);
  return filename;
}

export function storageImagePath(filename: string) {
  return path.join(process.cwd(), "storage", "images", path.basename(filename));
}
