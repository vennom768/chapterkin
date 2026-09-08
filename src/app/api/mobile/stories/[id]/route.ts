import { after } from "next/server";
import { corsJson, corsOptions, mobileError } from "@/lib/mobile/http";
import { serializeStoryDetail } from "@/lib/mobile/serialize";
import { requireMobileUser } from "@/lib/mobile/session";
import { getStoryForUser } from "@/lib/queries/stories";
import { markStoryReadForUser } from "@/lib/services/sharing";
import { ensureStoryReaderLevels } from "@/lib/story-reader-levels";

export function OPTIONS() {
  return corsOptions();
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireMobileUser(request);
  if (!user) return response;
  const { id } = await context.params;
  const result = await getStoryForUser(user.id, id);
  if (!result) {
    return mobileError("That story was not found.", 404);
  }

  after(() => {
    void ensureStoryReaderLevels(result.pages);
    void markStoryReadForUser(result.story.id, user.id);
  });

  return corsJson(serializeStoryDetail(result));
}
