import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  childProfile,
  householdMember,
  storySeries,
} from "@/lib/db/schema";
import type { StoryPerson } from "@/lib/ai/character-bible";

export async function listChildren(userId: string) {
  return db
    .select()
    .from(childProfile)
    .where(eq(childProfile.userId, userId))
    .orderBy(childProfile.age);
}

export async function getChildForUser(userId: string, childId: string) {
  const [child] = await db
    .select()
    .from(childProfile)
    .where(and(eq(childProfile.id, childId), eq(childProfile.userId, userId)))
    .limit(1);
  return child ?? null;
}

function appearanceFromChild(child: typeof childProfile.$inferSelect) {
  return [child.hair, child.eyes, child.skin, child.usualClothes]
    .filter(Boolean)
    .join(", ");
}

export async function getChildWithStoryCast(userId: string, childId: string) {
  const child = await getChildForUser(userId, childId);
  if (!child) {
    return null;
  }

  const [siblings, household] = await Promise.all([
    db
      .select()
      .from(childProfile)
      .where(
        and(
          eq(childProfile.familyId, child.familyId),
          ne(childProfile.id, child.id),
        ),
      )
      .orderBy(childProfile.age),
    db
      .select()
      .from(householdMember)
      .where(eq(householdMember.familyId, child.familyId)),
  ]);

  const characters: StoryPerson[] = [
    ...siblings.map((sibling) => ({
      name: sibling.calledBy.trim() || sibling.name,
      relationship: "sibling",
      appearance:
        [
          sibling.calledBy !== sibling.name ? `given name ${sibling.name}` : "",
          appearanceFromChild(sibling),
        ]
          .filter(Boolean)
          .join(", ") || null,
      speciesOrBreed: null,
    })),
    ...household.map((member) => ({
      name: member.name,
      relationship: member.relationship,
      appearance:
        member.appearance ||
        [member.hair, member.eyes, member.skin, member.usualClothes]
          .filter(Boolean)
          .join(", ") ||
        null,
      speciesOrBreed: member.speciesOrBreed,
    })),
  ];

  return { child, siblings, household, characters };
}

export async function listSeriesForChild(userId: string, childId: string) {
  return db
    .select()
    .from(storySeries)
    .where(and(eq(storySeries.userId, userId), eq(storySeries.childId, childId)))
    .orderBy(desc(storySeries.updatedAt));
}
