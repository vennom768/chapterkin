import { after } from "next/server";
import { and, eq } from "drizzle-orm";
import { trackEvent } from "@/lib/analytics";
import { db } from "@/lib/db";
import { childPortrait, childProfile } from "@/lib/db/schema";
import { revalidateChild } from "@/lib/portrait-generate";
import { getChildForUser } from "@/lib/queries/children";

export async function selectPortraitForUser(
  userId: string,
  childId: string,
  portraitId: string,
) {
  const child = await getChildForUser(userId, childId);
  if (!child) {
    return { ok: false as const, error: "Child profile not found." };
  }
  const [portrait] = await db
    .select()
    .from(childPortrait)
    .where(
      and(
        eq(childPortrait.id, portraitId),
        eq(childPortrait.childId, childId),
        eq(childPortrait.userId, userId),
      ),
    )
    .limit(1);
  if (!portrait) {
    return { ok: false as const, error: "That drawing was not found." };
  }
  await db
    .update(childProfile)
    .set({ selectedPortraitId: portraitId, updatedAt: new Date() })
    .where(eq(childProfile.id, childId));
  after(() =>
    trackEvent("portrait_selected", {
      userId,
      properties: { childId, portraitId },
    }),
  );
  revalidateChild(childId);
  return { ok: true as const };
}
