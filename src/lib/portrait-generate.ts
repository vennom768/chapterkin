import { after } from "next/server";
import { revalidatePath } from "next/cache";
import {
  PORTRAIT_VARIATIONS,
  generateChildPortraitPng,
  writePortraitFile,
} from "@/lib/ai/portraits";
import type { ImageReference } from "@/lib/ai/image-generate";
import { isMockStoryProvider } from "@/lib/ai/provider";
import { trackEvent } from "@/lib/analytics";
import { db } from "@/lib/db";
import { childPortrait, childProfile } from "@/lib/db/schema";
import { portraitsRemaining } from "@/lib/portraits";
import { listPortraitsForChild } from "@/lib/queries/portraits";
import { createId } from "@/lib/utils";

const PHOTO_MAX_BYTES = 6 * 1024 * 1024;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const portraitJobs = new Map<string, Promise<unknown>>();

export function revalidateChild(childId: string) {
  revalidatePath(`/children/${childId}`);
  revalidatePath(`/children/${childId}/portrait`);
  revalidatePath("/family");
  revalidatePath("/home");
}

export async function readTemporaryPhoto(
  formData: FormData,
): Promise<ImageReference | undefined> {
  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return undefined;
  }
  if (photo.size > PHOTO_MAX_BYTES) {
    throw new Error("That photo is too large. Use a picture under 6 MB.");
  }
  if (photo.type && !PHOTO_TYPES.has(photo.type)) {
    throw new Error("Use a JPG, PNG, or WebP photo.");
  }
  return {
    buffer: Buffer.from(await photo.arrayBuffer()),
    mime: photo.type || "image/jpeg",
    filename: "parent-photo-temp.jpg",
  };
}

export async function generatePortraitBatch(
  userId: string,
  child: typeof childProfile.$inferSelect,
  count: number,
  photo?: ImageReference,
) {
  const jobKey = `${userId}:${child.id}`;
  const inflight = portraitJobs.get(jobKey);
  if (inflight) {
    await inflight;
    return listPortraitsForChild(userId, child.id);
  }

  const job = runPortraitBatch(userId, child, count, photo);
  portraitJobs.set(jobKey, job);
  try {
    return await job;
  } finally {
    portraitJobs.delete(jobKey);
  }
}

async function runPortraitBatch(
  userId: string,
  child: typeof childProfile.$inferSelect,
  count: number,
  photo?: ImageReference,
) {
  const existing = await listPortraitsForChild(userId, child.id);
  const allowed = portraitsRemaining(existing.length, child.portraitPacks ?? 0);
  const toMake = Math.min(count, allowed);
  if (toMake <= 0) {
    return existing;
  }

  const results = await Promise.allSettled(
    Array.from({ length: toMake }, async (_, index) => {
      const variation = PORTRAIT_VARIATIONS[index % PORTRAIT_VARIATIONS.length];
      const png = await generateChildPortraitPng(child, {
        note: variation,
        photo,
      });
      const id = createId();
      const imagePath = await writePortraitFile(id, png, isMockStoryProvider());
      await db.insert(childPortrait).values({
        id,
        childId: child.id,
        userId,
        imagePath,
        source: photo ? "photo" : "builder",
        note: variation,
        createdAt: new Date(),
      });
      return id;
    }),
  );
  const created = results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
  if (created.length === 0) {
    const first = results.find((result) => result.status === "rejected");
    throw first && first.status === "rejected"
      ? first.reason
      : new Error("Could not draw these pictures.");
  }

  after(() =>
    trackEvent("portrait_generated", {
      userId,
      properties: {
        childId: child.id,
        source: photo ? "photo" : "builder",
        count: created.length,
      },
    }),
  );
  revalidateChild(child.id);
  return listPortraitsForChild(userId, child.id);
}
