import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { childProfile, story, storyPage, storySeries } from "@/lib/db/schema";
import { isStoryExpired } from "@/lib/story-retention";

export async function getStoryByShareToken(token: string) {
  const [row] = await db
    .select({
      story,
      child: childProfile,
      series: storySeries,
    })
    .from(story)
    .innerJoin(childProfile, eq(story.childId, childProfile.id))
    .leftJoin(storySeries, eq(story.seriesId, storySeries.id))
    .where(eq(story.shareToken, token))
    .limit(1);
  if (!row || isStoryExpired(row.story.lastReadAt)) {
    return null;
  }
  const pages = await db
    .select()
    .from(storyPage)
    .where(eq(storyPage.storyId, row.story.id));
  return {
    ...row,
    pages: pages.sort((a, b) => a.pageIndex - b.pageIndex),
  };
}
