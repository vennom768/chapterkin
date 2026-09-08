"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { promoCode } from "@/lib/db/schema";
import {
  applyPromoCode,
  inspectPromoCode,
  isPromoBenefit,
  normalizePromoCode,
  type PromoResult,
} from "@/lib/promo";
import { getCurrentUser, requireAdmin } from "@/lib/session";
import { createId } from "@/lib/utils";

export async function validatePromoCode(code: string): Promise<PromoResult> {
  return inspectPromoCode(code);
}

export async function redeemPromoCode(code: string): Promise<PromoResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Sign in to use a promo code." };
  }
  const result = await applyPromoCode(user.id, code);
  if (result.ok) {
    revalidatePath("/billing");
    revalidatePath("/home");
    revalidatePath("/admin");
  }
  return result;
}

const createSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters.")
    .max(64, "That code is too long."),
  benefit: z.string().default("unlimited"),
  maxRedemptions: z.string().optional(),
  note: z.string().trim().max(200).optional(),
});

export async function createPromoCode(formData: FormData): Promise<PromoResult> {
  await requireAdmin();
  const parsed = createSchema.safeParse({
    code: formData.get("code"),
    benefit: formData.get("benefit") || "unlimited",
    maxRedemptions: formData.get("maxRedemptions") ?? "",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  if (!isPromoBenefit(parsed.data.benefit)) {
    return { ok: false, error: "Choose a valid benefit." };
  }

  const maxRaw = parsed.data.maxRedemptions?.trim() ?? "";
  let maxRedemptions: number | null = null;
  if (maxRaw) {
    const parsedMax = Number(maxRaw);
    if (!Number.isInteger(parsedMax) || parsedMax < 1) {
      return { ok: false, error: "Max uses must be a whole number, or blank." };
    }
    maxRedemptions = parsedMax;
  }

  const codeKey = normalizePromoCode(parsed.data.code);
  const [existing] = await db
    .select({ id: promoCode.id })
    .from(promoCode)
    .where(eq(promoCode.codeKey, codeKey))
    .limit(1);
  if (existing) {
    return { ok: false, error: "That promo code already exists." };
  }

  const now = new Date();
  await db.insert(promoCode).values({
    id: createId(),
    code: parsed.data.code.trim(),
    codeKey,
    benefit: parsed.data.benefit,
    active: true,
    maxRedemptions,
    note: parsed.data.note || null,
    createdAt: now,
    updatedAt: now,
  });
  revalidatePath("/admin");
  return { ok: true };
}

export async function setPromoCodeActive(id: string, active: boolean) {
  await requireAdmin();
  await db
    .update(promoCode)
    .set({ active, updatedAt: new Date() })
    .where(eq(promoCode.id, id));
  redirect("/admin");
}
