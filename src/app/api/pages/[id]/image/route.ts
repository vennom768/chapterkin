import { readFile } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { story, storyPage } from "@/lib/db/schema";
import { isStoryExpired } from "@/lib/story-retention";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const share = new URL(request.url).searchParams.get("share");
  const session = await auth.api.getSession({ headers: request.headers });

  const [row] = await db
    .select({
      page: storyPage,
      story,
    })
    .from(storyPage)
    .innerJoin(story, eq(storyPage.storyId, story.id))
    .where(
      and(
        eq(storyPage.id, id),
        share
          ? eq(story.shareToken, share)
          : session?.user
            ? eq(story.userId, session.user.id)
            : eq(story.id, "__none__"),
      ),
    )
    .limit(1);

  if (!row?.page.imagePath || isStoryExpired(row.story.lastReadAt)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filename = path.basename(row.page.imagePath);
  const absolute = path.join(process.cwd(), "storage", "images", filename);
  const data = await readFile(absolute);
  const contentType = filename.endsWith(".svg") ? "image/svg+xml" : "image/png";
  return new NextResponse(data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
