import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { childProfile, family, householdMember } from "@/lib/db/schema";
import { getFamilyForUser } from "@/lib/queries/family";
import { createId } from "@/lib/utils";

export const childDraftSchema = z.object({
  name: z.string().min(1, "Each child needs a name").max(80),
  calledBy: z.string().min(1, "Tell us what you call them").max(80),
  age: z.coerce.number().int().min(0).max(12),
  ageMonths: z.coerce.number().int().min(0).max(11).optional().nullable(),
  sex: z.enum(["boy", "girl"], { message: "Choose boy or girl for each child." }),
  favoriteThings: z
    .string()
    .min(2, "Tell us a little about each child")
    .max(400),
  callsMom: z.string().max(40).optional().nullable(),
  callsDad: z.string().max(40).optional().nullable(),
  hair: z.string().max(160).optional().nullable(),
  eyes: z.string().max(120).optional().nullable(),
  skin: z.string().max(120).optional().nullable(),
  usualClothes: z.string().max(240).optional().nullable(),
  notes: z.string().max(600).optional().nullable(),
});

export const householdDraftSchema = z.object({
  name: z.string().min(1).max(80),
  relationship: z.enum(["parent", "grandparent", "friend", "pet", "other"]),
  appearance: z.string().max(400).optional().nullable(),
  speciesOrBreed: z.string().max(120).optional().nullable(),
  hair: z.string().max(160).optional().nullable(),
  eyes: z.string().max(120).optional().nullable(),
  skin: z.string().max(120).optional().nullable(),
  usualClothes: z.string().max(240).optional().nullable(),
});

export const onboardingSchema = z.object({
  familyName: z.string().min(1, "Family name is required").max(80),
  notes: z.string().max(600).optional().nullable(),
  children: z.array(childDraftSchema).min(1, "Add at least one child").max(8),
  household: z.array(householdDraftSchema).max(16).default([]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type HouseholdDraft = z.infer<typeof householdDraftSchema>;

export async function createFamilyOnboarding(userId: string, input: OnboardingInput) {
  const existing = await getFamilyForUser(userId);
  if (existing) {
    return { ok: false as const, error: "Family is already set up.", redirectTo: "/home" };
  }

  const now = new Date();
  const familyId = createId();

  await db.insert(family).values({
    id: familyId,
    userId,
    name: input.familyName.trim(),
    notes: input.notes?.trim() || null,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(childProfile).values(
    input.children.map((child) => ({
      id: createId(),
      userId,
      familyId,
      name: child.name.trim(),
      calledBy: child.calledBy.trim(),
      age: child.age,
      ageMonths: child.age < 1 ? (child.ageMonths ?? 0) : null,
      sex: child.sex,
      favoriteThings: child.favoriteThings.trim(),
      callsMom: child.callsMom ?? null,
      callsDad: child.callsDad ?? null,
      hair: child.hair?.trim() || null,
      eyes: child.eyes?.trim() || null,
      skin: child.skin?.trim() || null,
      usualClothes: child.usualClothes?.trim() || null,
      notes: child.notes?.trim() || null,
      createdAt: now,
      updatedAt: now,
    })),
  );

  if (input.household.length) {
    await db.insert(householdMember).values(
      input.household.map((member) => ({
        id: createId(),
        familyId,
        name: member.name.trim(),
        relationship: member.relationship,
        appearance: member.appearance ?? null,
        speciesOrBreed: member.speciesOrBreed ?? null,
        hair: member.hair ?? null,
        eyes: member.eyes ?? null,
        skin: member.skin ?? null,
        usualClothes: member.usualClothes ?? null,
      })),
    );
  }

  return { ok: true as const };
}

export async function updateFamilyDetails(
  userId: string,
  input: { familyName: string; notes?: string | null },
) {
  const current = await getFamilyForUser(userId);
  if (!current) {
    return { ok: false as const, error: "Finish family setup first.", redirectTo: "/onboarding" };
  }
  const name = input.familyName.trim();
  if (!name) {
    return { ok: false as const, error: "Family name is required." };
  }

  await db
    .update(family)
    .set({
      name,
      notes: input.notes?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(family.id, current.id));

  return { ok: true as const };
}

export async function replaceHousehold(userId: string, members: HouseholdDraft[]) {
  const current = await getFamilyForUser(userId);
  if (!current) {
    return { ok: false as const, error: "Finish family setup first.", redirectTo: "/onboarding" };
  }

  await db.delete(householdMember).where(eq(householdMember.familyId, current.id));
  if (members.length) {
    await db.insert(householdMember).values(
      members.map((member) => ({
        id: createId(),
        familyId: current.id,
        name: member.name.trim(),
        relationship: member.relationship,
        appearance: member.appearance ?? null,
        speciesOrBreed: member.speciesOrBreed ?? null,
        hair: member.hair ?? null,
        eyes: member.eyes ?? null,
        skin: member.skin ?? null,
        usualClothes: member.usualClothes ?? null,
      })),
    );
  }

  return { ok: true as const };
}
