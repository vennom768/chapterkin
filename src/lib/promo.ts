import { count, eq, sql } from "drizzle-orm";
import { getSubscriptionForUser, hasPaidAccess } from "@/lib/billing";
import { db } from "@/lib/db";
import { promoCode, promoRedemption, subscription } from "@/lib/db/schema";
import { createId } from "@/lib/utils";

export const PROMO_BENEFITS = {
  unlimited: {
    id: "unlimited",
    planId: "nightly",
    label: "Free unlimited account",
  },
} as const;

export type PromoBenefit = keyof typeof PROMO_BENEFITS;

export function isPromoBenefit(value: string): value is PromoBenefit {
  return value in PROMO_BENEFITS;
}

export function normalizePromoCode(raw: string) {
  return raw.trim().toLowerCase();
}

const INVALID_CODE = "That promo code is not valid.";

export type PromoResult = { ok: true } | { ok: false; error: string };

export async function findPromoCode(raw: string) {
  const codeKey = normalizePromoCode(raw);
  if (!codeKey) return null;
  const [row] = await db
    .select()
    .from(promoCode)
    .where(eq(promoCode.codeKey, codeKey))
    .limit(1);
  return row ?? null;
}

export async function countPromoRedemptions(promoCodeId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(promoRedemption)
    .where(eq(promoRedemption.promoCodeId, promoCodeId));
  return row?.value ?? 0;
}

export async function inspectPromoCode(raw: string): Promise<PromoResult> {
  const code = await findPromoCode(raw);
  if (!code || !code.active || !isPromoBenefit(code.benefit)) {
    return { ok: false, error: INVALID_CODE };
  }
  if (code.maxRedemptions != null) {
    const used = await countPromoRedemptions(code.id);
    if (used >= code.maxRedemptions) {
      return { ok: false, error: INVALID_CODE };
    }
  }
  return { ok: true };
}

export async function applyPromoCode(userId: string, raw: string): Promise<PromoResult> {
  const codeKey = normalizePromoCode(raw);
  if (!codeKey) {
    return { ok: false, error: INVALID_CODE };
  }

  const existing = await getSubscriptionForUser(userId);
  if (!canRedeemAgainstSubscription(existing?.status)) {
    return {
      ok: false,
      error:
        existing?.status === "promo"
          ? "This account already has a promo plan."
          : "This account already has a plan.",
    };
  }

  try {
    await db.transaction(async (tx) => {
      const [code] = await tx
        .select()
        .from(promoCode)
        .where(eq(promoCode.codeKey, codeKey))
        .limit(1);
      if (!code || !code.active || !isPromoBenefit(code.benefit)) {
        throw new Error("invalid");
      }

      const [already] = await tx
        .select({ id: promoRedemption.id })
        .from(promoRedemption)
        .where(eq(promoRedemption.userId, userId))
        .limit(1);
      if (already) {
        throw new Error("already");
      }

      if (code.maxRedemptions != null) {
        const [used] = await tx
          .select({ value: count() })
          .from(promoRedemption)
          .where(eq(promoRedemption.promoCodeId, code.id));
        if ((used?.value ?? 0) >= code.maxRedemptions) {
          throw new Error("invalid");
        }
      }

      await tx.insert(promoRedemption).values({
        id: createId(),
        promoCodeId: code.id,
        userId,
      });

      const benefit = PROMO_BENEFITS[code.benefit];
      const now = new Date();
      const [sub] = await tx
        .select({ id: subscription.id })
        .from(subscription)
        .where(eq(subscription.userId, userId))
        .limit(1);
      if (sub) {
        await tx
          .update(subscription)
          .set({
            planId: benefit.planId,
            status: "promo",
            currentPeriodStart: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            updatedAt: now,
          })
          .where(eq(subscription.userId, userId));
      } else {
        await tx.insert(subscription).values({
          id: createId(),
          userId,
          planId: benefit.planId,
          status: "promo",
          currentPeriodStart: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          createdAt: now,
          updatedAt: now,
        });
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "already") {
      return { ok: false, error: "This account already used a promo code." };
    }
    return { ok: false, error: INVALID_CODE };
  }

  return { ok: true };
}

export async function listPromoCodesWithUsage() {
  try {
    return await db
      .select({
        id: promoCode.id,
        code: promoCode.code,
        benefit: promoCode.benefit,
        active: promoCode.active,
        maxRedemptions: promoCode.maxRedemptions,
        note: promoCode.note,
        createdAt: promoCode.createdAt,
        redemptions: sql<number>`coalesce(count(${promoRedemption.id}), 0)`.mapWith(Number),
      })
      .from(promoCode)
      .leftJoin(promoRedemption, eq(promoRedemption.promoCodeId, promoCode.id))
      .groupBy(promoCode.id)
      .orderBy(promoCode.createdAt);
  } catch {
    return [];
  }
}

export function canRedeemAgainstSubscription(status: string | null | undefined) {
  if (!status || status === "none") return true;
  if (status === "promo") return false;
  return !hasPaidAccess(status);
}
