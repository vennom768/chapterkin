import { lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { story } from "@/lib/db/schema";

export const STORY_RETENTION_DAYS = 60;

export function storyRetentionCutoff(now = new Date()) {
  return new Date(now.getTime() - STORY_RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

export function isStoryExpired(lastReadAt: Date | null | undefined, now = new Date()) {
  if (!lastReadAt) return false;
  return lastReadAt.getTime() < storyRetentionCutoff(now).getTime();
}

export async function expireUnreadStories() {
  await db.delete(story).where(lt(story.lastReadAt, storyRetentionCutoff()));
}
