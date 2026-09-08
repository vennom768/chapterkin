import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { trackEvent } from "@/lib/analytics";
import { db } from "@/lib/db";
import { childProfile } from "@/lib/db/schema";
import { getFamilyForUser } from "@/lib/queries/family";
import { listChildren } from "@/lib/queries/children";
import { createId } from "@/lib/utils";

export const childInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  calledBy: z.string().min(1, "Tell us what you call them").max(80),
  age: z.coerce.number().int().min(0).max(12),
  ageMonths: z.coerce.number().int().min(0).max(11).optional().nullable(),
  sex: z.enum(["boy", "girl"], { message: "Choose boy or girl." }),
  hair: z.string().max(240).optional().nullable(),
  eyes: z.string().max(200).optional().nullable(),
  skin: z.string().max(200).optional().nullable(),
  usualClothes: z.string().max(280).optional().nullable(),
  favoriteThings: z.string().min(2, "Tell us a little about them").max(400),
  callsMom: z.string().max(40).optional().nullable(),
  callsDad: z.string().max(40).optional().nullable(),
  notes: z.string().max(600).optional().nullable(),
});

export type ChildInput = z.infer<typeof childInputSchema>;

export type SaveChildResult =
  | { ok: true; childId: string; created: boolean }
  | { ok: false; error: string; redirectTo?: string };

function emptyToNull(value: string | null | undefined) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function normalizeChildInput(data: ChildInput): ChildInput {
  return {
    ...data,
    name: data.name.trim(),
    calledBy: data.calledBy.trim(),
    favoriteThings: data.favoriteThings.trim(),
    hair: emptyToNull(data.hair),
    eyes: emptyToNull(data.eyes),
    skin: emptyToNull(data.skin),
    usualClothes: emptyToNull(data.usualClothes),
    callsMom: emptyToNull(data.callsMom),
    callsDad: emptyToNull(data.callsDad),
    notes: emptyToNull(data.notes),
    ageMonths: data.age < 1 ? (data.ageMonths ?? 0) : null,
  };
}

export async function upsertChild(
  userId: string,
  input: ChildInput,
  childId?: string | null,
): Promise<SaveChildResult> {
  const household = await getFamilyForUser(userId);
  if (!household) {
    return { ok: false, error: "Finish family setup first.", redirectTo: "/onboarding" };
  }

  const data = normalizeChildInput(input);
  const now = new Date();

  if (childId) {
    const existing = await db
      .select()
      .from(childProfile)
      .where(and(eq(childProfile.id, childId), eq(childProfile.userId, userId)))
      .limit(1);
    if (!existing[0]) {
      return { ok: false, error: "Child profile not found." };
    }

    await db
      .update(childProfile)
      .set({
        name: data.name,
        calledBy: data.calledBy,
        age: data.age,
        ageMonths: data.ageMonths,
        sex: data.sex,
        hair: data.hair,
        eyes: data.eyes,
        skin: data.skin,
        usualClothes: data.usualClothes,
        favoriteThings: data.favoriteThings,
        callsMom: data.callsMom,
        callsDad: data.callsDad,
        notes: data.notes,
        updatedAt: now,
      })
      .where(eq(childProfile.id, childId));

    return { ok: true, childId, created: false };
  }

  const id = createId();
  await db.insert(childProfile).values({
    id,
    userId,
    familyId: household.id,
    name: data.name,
    calledBy: data.calledBy,
    age: data.age,
    ageMonths: data.ageMonths,
    sex: data.sex,
    hair: data.hair,
    eyes: data.eyes,
    skin: data.skin,
    usualClothes: data.usualClothes,
    favoriteThings: data.favoriteThings,
    callsMom: data.callsMom,
    callsDad: data.callsDad,
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
  });

  void trackEvent("child_created", {
    userId,
    properties: { childId: id },
  });
  return { ok: true, childId: id, created: true };
}

export async function deleteChildForUser(userId: string, childId: string) {
  const kids = await listChildren(userId);
  if (kids.length <= 1) {
    return { ok: false as const, error: "A family needs at least one child." };
  }
  const exists = kids.some((child) => child.id === childId);
  if (!exists) {
    return { ok: false as const, error: "Child profile not found." };
  }

  await db
    .delete(childProfile)
    .where(and(eq(childProfile.id, childId), eq(childProfile.userId, userId)));
  return { ok: true as const };
}
