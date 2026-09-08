import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { childPortrait } from "@/lib/db/schema";

export async function listPortraitsForChild(userId: string, childId: string) {
  return db
    .select()
    .from(childPortrait)
    .where(and(eq(childPortrait.userId, userId), eq(childPortrait.childId, childId)))
    .orderBy(asc(childPortrait.createdAt));
}

export async function getPortraitForUser(userId: string, portraitId: string) {
  const [row] = await db
    .select()
    .from(childPortrait)
    .where(and(eq(childPortrait.id, portraitId), eq(childPortrait.userId, userId)))
    .limit(1);
  return row ?? null;
}
