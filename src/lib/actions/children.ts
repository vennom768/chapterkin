"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { childProfile } from "@/lib/db/schema";
import { getFamilyForUser } from "@/lib/queries/family";
import { listChildren } from "@/lib/queries/children";
import { trackEvent } from "@/lib/analytics";
import { requireUser } from "@/lib/session";
import { createId } from "@/lib/utils";

const childSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  calledBy: z.string().min(1, "Tell us what you call them").max(80),
  age: z.coerce.number().int().min(0).max(12),
  ageMonths: z.coerce.number().int().min(0).max(11).optional().nullable(),
  hair: z.string().max(240).optional().nullable(),
  eyes: z.string().max(200).optional().nullable(),
  skin: z.string().max(200).optional().nullable(),
  usualClothes: z.string().max(280).optional().nullable(),
  favoriteThings: z.string().min(2, "Tell us a little about them").max(400),
  callsMom: z.string().max(40).optional().nullable(),
  callsDad: z.string().max(40).optional().nullable(),
  notes: z.string().max(600).optional().nullable(),
});

function emptyToNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function saveChild(formData: FormData) {
  const user = await requireUser();
  const household = await getFamilyForUser(user.id);
  if (!household) {
    redirect("/onboarding");
  }

  const childId = emptyToNull(formData.get("id"));
  const parsed = childSchema.safeParse({
    name: formData.get("name"),
    calledBy: String(formData.get("calledBy") ?? "").trim(),
    age: formData.get("age"),
    ageMonths: formData.get("ageMonths") || undefined,
    hair: emptyToNull(formData.get("hair")),
    eyes: emptyToNull(formData.get("eyes")),
    skin: emptyToNull(formData.get("skin")),
    usualClothes: emptyToNull(formData.get("usualClothes")),
    favoriteThings: String(formData.get("favoriteThings") ?? "").trim(),
    callsMom: emptyToNull(formData.get("callsMom")),
    callsDad: emptyToNull(formData.get("callsDad")),
    notes: emptyToNull(formData.get("notes")),
  });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Please check the profile details.",
    );
  }

  const data = parsed.data;
  const now = new Date();

  if (childId) {
    const existing = await db
      .select()
      .from(childProfile)
      .where(and(eq(childProfile.id, childId), eq(childProfile.userId, user.id)))
      .limit(1);
    if (!existing[0]) {
      throw new Error("Child profile not found");
    }

    await db
      .update(childProfile)
      .set({
        name: data.name,
        calledBy: data.calledBy,
        age: data.age,
        ageMonths: data.age < 1 ? (data.ageMonths ?? 0) : null,
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

    revalidatePath("/family");
    revalidatePath(`/children/${childId}`);
    revalidatePath("/home");
    redirect(`/children/${childId}`);
  }

  const id = createId();
  await db.insert(childProfile).values({
    id,
    userId: user.id,
    familyId: household.id,
    name: data.name,
    calledBy: data.calledBy,
    age: data.age,
    ageMonths: data.age < 1 ? (data.ageMonths ?? 0) : null,
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

  revalidatePath("/family");
  revalidatePath("/home");
  void trackEvent("child_created", {
    userId: user.id,
    properties: { childId: id },
  });
  redirect(`/children/${id}/portrait`);
}

export async function deleteChild(childId: string) {
  const user = await requireUser();
  const kids = await listChildren(user.id);
  if (kids.length <= 1) {
    throw new Error("A family needs at least one child.");
  }

  await db
    .delete(childProfile)
    .where(and(eq(childProfile.id, childId), eq(childProfile.userId, user.id)));
  revalidatePath("/family");
  revalidatePath("/home");
  revalidatePath("/library");
  redirect("/family");
}
