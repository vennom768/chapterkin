"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/session";
import {
  createStoryForUser,
  generateStorySchema,
} from "@/lib/services/stories";

export async function createStory(input: z.infer<typeof generateStorySchema>) {
  const user = await requireUser();
  const result = await createStoryForUser(user.id, input);
  if (!result.ok) {
    return result;
  }

  revalidatePath("/library");
  revalidatePath("/home");
  revalidatePath(`/stories/${result.storyId}`);
  return result;
}
