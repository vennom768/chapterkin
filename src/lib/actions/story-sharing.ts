"use server";

import { and, eq } from "drizzle-orm";
import { after } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import { trackEvent } from "@/lib/analytics";
import { db } from "@/lib/db";
import { story } from "@/lib/db/schema";
import { isStoryExpired } from "@/lib/story-retention";
import { requireUser } from "@/lib/session";
import { createId } from "@/lib/utils";

export async function markStoryRead(storyId: string, userId?: string) {
  const conditions = [eq(story.id, storyId)];
  if (userId) {
    conditions.push(eq(story.userId, userId));
  }
  const [current] = await db
    .select({ id: story.id, userId: story.userId, lastReadAt: story.lastReadAt })
    .from(story)
    .where(and(...conditions))
    .limit(1);
  if (!current || isStoryExpired(current.lastReadAt)) {
    return;
  }
  await db.update(story).set({ lastReadAt: new Date() }).where(eq(story.id, storyId));
  after(() =>
    trackEvent("story_read", {
      userId: current.userId,
      properties: { storyId },
    }),
  );
}

export async function shareStory(storyId: string) {
  const user = await requireUser();
  const [current] = await db
    .select()
    .from(story)
    .where(and(eq(story.id, storyId), eq(story.userId, user.id)))
    .limit(1);
  if (!current || isStoryExpired(current.lastReadAt)) {
    throw new Error("That story was not found.");
  }
  const token = current.shareToken || createId();
  if (!current.shareToken) {
    await db.update(story).set({ shareToken: token }).where(eq(story.id, storyId));
  }
  after(() =>
    trackEvent("story_shared", {
      userId: user.id,
      properties: { storyId },
    }),
  );
  return `${getAppUrl()}/s/${token}`;
}
