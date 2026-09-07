import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { story, subscription } from "@/lib/db/schema";
import { COMPLIMENTARY_STORIES, PLANS, type PlanId, isPlanId } from "@/lib/plans";

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

export async function getSubscriptionForUser(userId: string) {
  const [row] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);
  return row ?? null;
}

export function hasPaidAccess(status: string | null | undefined) {
  return Boolean(status && ACTIVE_STATUSES.has(status));
}

export async function countStoriesSince(userId: string, since?: Date | null) {
  const conditions = [eq(story.userId, userId)];
  if (since) {
    conditions.push(gte(story.createdAt, since));
  }
  const [row] = await db
    .select({ value: count() })
    .from(story)
    .where(and(...conditions));
  return row?.value ?? 0;
}

export async function getUsage(userId: string) {
  const record = await getSubscriptionForUser(userId);
  const paid = hasPaidAccess(record?.status);
  const planId = paid && record?.planId && isPlanId(record.planId) ? record.planId : null;
  const plan = planId ? PLANS[planId] : null;
  const periodStart = paid ? record?.currentPeriodStart ?? null : null;
  const used = await countStoriesSince(userId, periodStart);
  const complimentaryUsed = paid ? 0 : await countStoriesSince(userId);
  const limit = plan ? plan.storiesPerMonth : COMPLIMENTARY_STORIES;
  const remaining =
    limit == null ? Number.POSITIVE_INFINITY : Math.max(0, limit - (paid ? used : complimentaryUsed));

  return {
    record,
    plan,
    planId,
    paid,
    used: paid ? used : complimentaryUsed,
    limit,
    remaining,
    canGenerate: remaining > 0,
  };
}

export async function assertCanGenerateStory(userId: string) {
  const usage = await getUsage(userId);
  if (usage.canGenerate) {
    return usage;
  }
  if (!usage.paid) {
    throw new Error(
      "Your complimentary story is used. Choose a plan to keep writing nights.",
    );
  }
  throw new Error(
    `This month's ${usage.limit} stories are used. Upgrade or wait until the next billing date.`,
  );
}

export async function upsertSubscription(input: {
  userId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  planId: PlanId | "none";
  status: string;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}) {
  const existing = await getSubscriptionForUser(input.userId);
  const now = new Date();
  if (existing) {
    await db
      .update(subscription)
      .set({
        stripeCustomerId: input.stripeCustomerId ?? existing.stripeCustomerId,
        stripeSubscriptionId:
          input.stripeSubscriptionId ?? existing.stripeSubscriptionId,
        planId: input.planId,
        status: input.status,
        currentPeriodStart: input.currentPeriodStart ?? existing.currentPeriodStart,
        currentPeriodEnd: input.currentPeriodEnd ?? existing.currentPeriodEnd,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? existing.cancelAtPeriodEnd,
        updatedAt: now,
      })
      .where(eq(subscription.userId, input.userId));
    return;
  }
  await db.insert(subscription).values({
    id: crypto.randomUUID(),
    userId: input.userId,
    stripeCustomerId: input.stripeCustomerId ?? null,
    stripeSubscriptionId: input.stripeSubscriptionId ?? null,
    planId: input.planId,
    status: input.status,
    currentPeriodStart: input.currentPeriodStart ?? null,
    currentPeriodEnd: input.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
    createdAt: now,
    updatedAt: now,
  });
}
