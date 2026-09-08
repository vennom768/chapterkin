"use server";

import { requireUser } from "@/lib/session";
import { markStoryReadForUser, shareStoryForUser } from "@/lib/services/sharing";

export async function markStoryRead(storyId: string, userId?: string) {
  await markStoryReadForUser(storyId, userId);
}

export async function shareStory(storyId: string) {
  const user = await requireUser();
  const result = await shareStoryForUser(user.id, storyId);
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.url;
}
