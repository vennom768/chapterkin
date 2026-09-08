import { count, desc, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  analyticsEvent,
  childPortrait,
  childProfile,
  family,
  story,
  subscription,
  user,
} from "@/lib/db/schema";
import { storyRetentionCutoff } from "@/lib/story-retention";

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function getAdminDashboardStats() {
  const week = daysAgo(7);
  const month = daysAgo(30);
  const [
    [users],
    [families],
    [children],
    [stories],
    [activeStories],
    [portraits],
    [paid],
    [storiesWeek],
    [storiesMonth],
    recentEvents,
    planRows,
  ] = await Promise.all([
    db.select({ total: count() }).from(user),
    db.select({ total: count() }).from(family),
    db.select({ total: count() }).from(childProfile),
    db.select({ total: count() }).from(story),
    db
      .select({ total: count() })
      .from(story)
      .where(gte(story.lastReadAt, storyRetentionCutoff())),
    db.select({ total: count() }).from(childPortrait),
    db
      .select({ total: count() })
      .from(subscription)
      .where(sql`${subscription.status} in ('active', 'trialing', 'promo')`),
    db.select({ total: count() }).from(story).where(gte(story.createdAt, week)),
    db.select({ total: count() }).from(story).where(gte(story.createdAt, month)),
    db
      .select()
      .from(analyticsEvent)
      .where(gte(analyticsEvent.createdAt, month))
      .orderBy(desc(analyticsEvent.createdAt))
      .limit(4000),
    db
      .select({
        planId: subscription.planId,
        status: subscription.status,
        total: count(),
      })
      .from(subscription)
      .groupBy(subscription.planId, subscription.status),
  ]);

  const eventCounts = new Map<string, { week: number; month: number }>();
  for (const event of recentEvents) {
    const row = eventCounts.get(event.name) ?? { week: 0, month: 0 };
    row.month += 1;
    if (event.createdAt >= week) row.week += 1;
    eventCounts.set(event.name, row);
  }

  return {
    users: users.total,
    families: families.total,
    children: children.total,
    stories: stories.total,
    activeStories: activeStories.total,
    portraits: portraits.total,
    paying: paid.total,
    storiesWeek: storiesWeek.total,
    storiesMonth: storiesMonth.total,
    events: [...eventCounts.entries()]
      .map(([name, counts]) => ({ name, ...counts }))
      .sort((a, b) => b.month - a.month),
    plans: planRows,
  };
}
