"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { childProfile, family, householdMember } from "@/lib/db/schema";
import { getFamilyForUser } from "@/lib/queries/family";
import { requireUser } from "@/lib/session";
import { createId } from "@/lib/utils";

const childDraftSchema = z.object({
  name: z.string().min(1, "Each child needs a name").max(80),
  calledBy: z.string().min(1, "Tell us what you call them").max(80),
  age: z.coerce.number().int().min(0).max(12),
  ageMonths: z.coerce.number().int().min(0).max(11).optional().nullable(),
  favoriteThings: z
    .string()
    .min(2, "Tell us a little about each child")
    .max(400),
  callsMom: z.string().max(40).optional().nullable(),
  callsDad: z.string().max(40).optional().nullable(),
});

const householdDraftSchema = z.object({
  name: z.string().min(1).max(80),
  relationship: z.enum(["parent", "grandparent", "friend", "pet", "other"]),
  appearance: z.string().max(400).optional().nullable(),
  speciesOrBreed: z.string().max(80).optional().nullable(),
  hair: z.string().max(160).optional().nullable(),
  eyes: z.string().max(120).optional().nullable(),
  skin: z.string().max(120).optional().nullable(),
  usualClothes: z.string().max(240).optional().nullable(),
});

const onboardingSchema = z.object({
  familyName: z.string().min(1, "Family name is required").max(80),
  notes: z.string().max(600).optional().nullable(),
  children: z.array(childDraftSchema).min(1, "Add at least one child").max(8),
  household: z.array(householdDraftSchema).max(16).default([]),
});

function emptyToNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function parseJsonArray<T>(value: FormDataEntryValue | null, schema: z.ZodType<T[]>) {
  if (typeof value !== "string" || !value.trim()) {
    return schema.parse([]);
  }
  return schema.parse(JSON.parse(value));
}

export async function saveFamilyOnboarding(formData: FormData) {
  const user = await requireUser();
  const existing = await getFamilyForUser(user.id);
  if (existing) {
    redirect("/home");
  }

  const parsed = onboardingSchema.safeParse({
    familyName: formData.get("familyName"),
    notes: emptyToNull(formData.get("notes")),
    children: parseJsonArray(formData.get("children"), z.array(childDraftSchema)),
    household: parseJsonArray(
      formData.get("household"),
      z.array(householdDraftSchema),
    ),
  });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Please check your family details.",
    );
  }

  const now = new Date();
  const familyId = createId();

  await db.insert(family).values({
    id: familyId,
    userId: user.id,
    name: parsed.data.familyName,
    notes: parsed.data.notes,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(childProfile).values(
    parsed.data.children.map((child) => ({
      id: createId(),
      userId: user.id,
      familyId,
      name: child.name,
      calledBy: child.calledBy,
      age: child.age,
      ageMonths: child.age < 1 ? (child.ageMonths ?? 0) : null,
      favoriteThings: child.favoriteThings,
      callsMom: child.callsMom ?? null,
      callsDad: child.callsDad ?? null,
      createdAt: now,
      updatedAt: now,
    })),
  );

  if (parsed.data.household.length) {
    await db.insert(householdMember).values(
      parsed.data.household.map((member) => ({
        id: createId(),
        familyId,
        name: member.name,
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

  revalidatePath("/home");
  revalidatePath("/family");
  redirect("/home");
}

export async function saveFamilyDetails(formData: FormData) {
  const user = await requireUser();
  const current = await getFamilyForUser(user.id);
  if (!current) {
    redirect("/onboarding");
  }

  const name = String(formData.get("familyName") ?? "").trim();
  if (!name) {
    throw new Error("Family name is required.");
  }

  await db
    .update(family)
    .set({
      name,
      notes: emptyToNull(formData.get("notes")),
      updatedAt: new Date(),
    })
    .where(eq(family.id, current.id));

  revalidatePath("/family");
  revalidatePath("/home");
  revalidatePath("/settings");
}

export async function saveHousehold(formData: FormData) {
  const user = await requireUser();
  const current = await getFamilyForUser(user.id);
  if (!current) {
    redirect("/onboarding");
  }

  const members = parseJsonArray(
    formData.get("household"),
    z.array(householdDraftSchema),
  );

  await db.delete(householdMember).where(eq(householdMember.familyId, current.id));
  if (members.length) {
    await db.insert(householdMember).values(
      members.map((member) => ({
        id: createId(),
        familyId: current.id,
        name: member.name,
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

  revalidatePath("/family");
  revalidatePath("/home");
}
