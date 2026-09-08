import { and, eq } from "drizzle-orm";
import { after } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import { trackEvent } from "@/lib/analytics";
import { db } from "@/lib/db";
import { story } from "@/lib/db/schema";
import { isStoryExpired } from "@/lib/story-retention";
import { createId } from "@/lib/utils";

export async function markStoryReadForUser(storyId: string, userId?: string) {
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
    return { ok: false as const, error: "That story was not found." };
  }
  await db.update(story).set({ lastReadAt: new Date() }).where(eq(story.id, storyId));
  after(() =>
    trackEvent("story_read", {
      userId: current.userId,
      properties: { storyId },
    }),
  );
  return { ok: true as const };
}

export async function shareStoryForUser(userId: string, storyId: string) {
  const [current] = await db
    .select()
    .from(story)
    .where(and(eq(story.id, storyId), eq(story.userId, userId)))
    .limit(1);
  if (!current || isStoryExpired(current.lastReadAt)) {
    return { ok: false as const, error: "That story was not found." };
  }
  const token = current.shareToken || createId();
  if (!current.shareToken) {
    await db.update(story).set({ shareToken: token }).where(eq(story.id, storyId));
  }
  after(() =>
    trackEvent("story_shared", {
      userId,
      properties: { storyId },
    }),
  );
  return { ok: true as const, url: `${getAppUrl()}/s/${token}` };
}
