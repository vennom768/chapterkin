import { readFile } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { story, storyPage } from "@/lib/db/schema";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const [row] = await db
    .select({
      page: storyPage,
      userId: story.userId,
    })
    .from(storyPage)
    .innerJoin(story, eq(storyPage.storyId, story.id))
    .where(and(eq(storyPage.id, id), eq(story.userId, session.user.id)))
    .limit(1);

  if (!row?.page.imagePath) {
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
