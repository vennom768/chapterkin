import { NextResponse } from "next/server";
import { after } from "next/server";
import { illustrateStory } from "@/lib/ai/images";
import { auth } from "@/lib/auth";
import { getStoryForUser } from "@/lib/queries/stories";

export async function POST(
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

  const pending = result.pages.some((page) => page.imageStatus === "pending");
  if (pending) {
    after(async () => {
      await illustrateStory(id);
    });
  }

  return NextResponse.json({ started: pending });
}
