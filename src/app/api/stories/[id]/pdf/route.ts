import { NextResponse } from "next/server";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";
import { getStoryByShareToken } from "@/lib/queries/shared-stories";
import { getStoryForUser } from "@/lib/queries/stories";
import { buildStoryPdf } from "@/lib/story-pdf";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const share = new URL(request.url).searchParams.get("share");
  const session = await auth.api.getSession({ headers: request.headers });

  const result = share
    ? await getStoryByShareToken(share)
    : session?.user
      ? await getStoryForUser(session.user.id, id)
      : null;

  if (!result || result.story.id !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pdf = await buildStoryPdf({
    title: result.story.title,
    childName: result.child.calledBy || result.child.name,
    pages: result.pages,
  });
  after(() =>
    trackEvent("story_pdf_downloaded", {
      userId: result.story.userId,
      properties: { storyId: id, shared: Boolean(share) },
    }),
  );

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slug(result.story.title)}.pdf"`,
    },
  });
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "chapterkin-story";
}
