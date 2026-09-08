"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, requireUser } from "@/lib/session";
import {
  childInputSchema,
  deleteChildForUser,
  upsertChild,
  type SaveChildResult,
} from "@/lib/services/children";

export type { SaveChildResult };

function emptyToNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function saveChild(formData: FormData): Promise<SaveChildResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Sign in to continue.", redirectTo: "/sign-in" };
  }

  const childId = emptyToNull(formData.get("id"));
  const parsed = childInputSchema.safeParse({
    name: formData.get("name"),
    calledBy: String(formData.get("calledBy") ?? "").trim(),
    age: formData.get("age"),
    ageMonths: formData.get("ageMonths") || undefined,
    sex: emptyToNull(formData.get("sex")),
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
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the profile details.",
    };
  }

  const result = await upsertChild(user.id, parsed.data, childId);
  if (!result.ok) {
    return result;
  }

  revalidatePath("/family");
  revalidatePath("/home");
  if (result.created) {
    revalidatePath(`/children/${result.childId}/portrait`);
  } else {
    revalidatePath(`/children/${result.childId}`);
  }
  return result;
}

export async function deleteChild(childId: string) {
  const user = await requireUser();
  const result = await deleteChildForUser(user.id, childId);
  if (!result.ok) {
    throw new Error(result.error);
  }
  revalidatePath("/family");
  revalidatePath("/home");
  revalidatePath("/library");
  redirect("/family");
}
