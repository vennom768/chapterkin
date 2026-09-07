import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStoryForUser } from "@/lib/queries/stories";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await getStoryForUser(session.user.id, id);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: result.story.status,
    pages: result.pages.map((page) => ({
      id: page.id,
      pageIndex: page.pageIndex,
      imageStatus: page.imageStatus,
      hasImage: Boolean(page.imagePath),
    })),
  });
}
