import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { childProfile, family, householdMember } from "@/lib/db/schema";

export async function getFamilyForUser(userId: string) {
  const [row] = await db
    .select()
    .from(family)
    .where(eq(family.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function getFamilyWithMembers(userId: string) {
  const current = await getFamilyForUser(userId);
  if (!current) {
    return null;
  }

  const [children, household] = await Promise.all([
    db
      .select()
      .from(childProfile)
      .where(eq(childProfile.familyId, current.id))
      .orderBy(childProfile.age),
    db
      .select()
      .from(householdMember)
      .where(eq(householdMember.familyId, current.id))
      .orderBy(desc(householdMember.createdAt)),
  ]);

  return { family: current, children, household };
}
