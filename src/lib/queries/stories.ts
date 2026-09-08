import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { childProfile, story, storyPage, storySeries } from "@/lib/db/schema";
import { isStoryExpired, storyRetentionCutoff } from "@/lib/story-retention";

export async function listStories(userId: string, filters?: {
  childId?: string;
  seriesId?: string;
  standaloneOnly?: boolean;
}) {
  const conditions = [
    eq(story.userId, userId),
    gte(story.lastReadAt, storyRetentionCutoff()),
  ];
  if (filters?.childId) {
    conditions.push(eq(story.childId, filters.childId));
  }
  if (filters?.seriesId) {
    conditions.push(eq(story.seriesId, filters.seriesId));
  }
  if (filters?.standaloneOnly) {
    conditions.push(eq(story.mode, "standalone"));
  }

  const rows = await db
    .select({
      story,
      childName: childProfile.calledBy,
      seriesTitle: storySeries.title,
    })
    .from(story)
    .innerJoin(childProfile, eq(story.childId, childProfile.id))
    .leftJoin(storySeries, eq(story.seriesId, storySeries.id))
    .where(and(...conditions))
    .orderBy(desc(story.createdAt));

  if (rows.length === 0) {
    return [];
  }

  const covers = await db
    .select({
      storyId: storyPage.storyId,
      id: storyPage.id,
      imageStatus: storyPage.imageStatus,
      imagePath: storyPage.imagePath,
    })
    .from(storyPage)
    .where(
      and(
        inArray(
          storyPage.storyId,
          rows.map((row) => row.story.id),
        ),
        eq(storyPage.kind, "cover"),
      ),
    );

  const coverByStory = new Map(covers.map((cover) => [cover.storyId, cover]));
  return rows.map((row) => ({
    ...row,
    cover: coverByStory.get(row.story.id) ?? null,
  }));
}

export async function getStoryForUser(userId: string, storyId: string) {
  const [row] = await db
    .select({
      story,
      child: childProfile,
      series: storySeries,
    })
    .from(story)
    .innerJoin(childProfile, eq(story.childId, childProfile.id))
    .leftJoin(storySeries, eq(story.seriesId, storySeries.id))
    .where(and(eq(story.id, storyId), eq(story.userId, userId)))
    .limit(1);

  if (!row || isStoryExpired(row.story.lastReadAt)) {
    return null;
  }

  const pages = await db
    .select()
    .from(storyPage)
    .where(eq(storyPage.storyId, storyId));

  return {
    ...row,
    pages: pages.sort((a, b) => a.pageIndex - b.pageIndex),
  };
}

export async function listSeries(userId: string) {
  return db
    .select({
      series: storySeries,
      childName: childProfile.name,
    })
    .from(storySeries)
    .innerJoin(childProfile, eq(storySeries.childId, childProfile.id))
    .where(eq(storySeries.userId, userId))
    .orderBy(desc(storySeries.updatedAt));
}
