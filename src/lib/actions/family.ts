"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/session";
import {
  childDraftSchema,
  householdDraftSchema,
  onboardingSchema,
  createFamilyOnboarding,
  replaceHousehold,
  updateFamilyDetails,
} from "@/lib/services/family";

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

  const result = await createFamilyOnboarding(user.id, parsed.data);
  if (!result.ok && result.redirectTo) {
    redirect(result.redirectTo);
  }
  if (!result.ok) {
    throw new Error(result.error);
  }

  revalidatePath("/home");
  revalidatePath("/family");
  redirect("/home");
}

export async function saveFamilyDetails(formData: FormData) {
  const user = await requireUser();
  const result = await updateFamilyDetails(user.id, {
    familyName: String(formData.get("familyName") ?? ""),
    notes: emptyToNull(formData.get("notes")),
  });
  if (!result.ok && result.redirectTo) {
    redirect(result.redirectTo);
  }
  if (!result.ok) {
    throw new Error(result.error);
  }

  revalidatePath("/family");
  revalidatePath("/home");
  revalidatePath("/settings");
}

export async function saveHousehold(formData: FormData) {
  const user = await requireUser();
  const members = parseJsonArray(
    formData.get("household"),
    z.array(householdDraftSchema),
  );
  const result = await replaceHousehold(user.id, members);
  if (!result.ok && result.redirectTo) {
    redirect(result.redirectTo);
  }
  if (!result.ok) {
    throw new Error(result.error);
  }

  revalidatePath("/family");
  revalidatePath("/home");
}
