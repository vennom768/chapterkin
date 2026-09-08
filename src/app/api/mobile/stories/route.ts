import { corsJson, corsOptions, mobileError } from "@/lib/mobile/http";
import { serializeStorySummary } from "@/lib/mobile/serialize";
import { requireMobileUser } from "@/lib/mobile/session";
import { listStories } from "@/lib/queries/stories";
import { createStoryForUser, generateStorySchema } from "@/lib/services/stories";

export const maxDuration = 180;

export function OPTIONS() {
  return corsOptions();
}

export async function GET(request: Request) {
  const { user, response } = await requireMobileUser(request);
  if (!user) return response;
  const url = new URL(request.url);
  const childId = url.searchParams.get("childId") || undefined;
  const stories = await listStories(user.id, { childId });
  return corsJson({
    stories: stories.map((row) =>
      serializeStorySummary({
        story: row.story,
        childName: row.childName,
        seriesTitle: row.seriesTitle,
        cover: row.cover,
      }),
    ),
  });
}

export async function POST(request: Request) {
  const { user, response } = await requireMobileUser(request);
  if (!user) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return mobileError("Send the story details as JSON.");
  }

  const parsed = generateStorySchema.safeParse(body);
  if (!parsed.success) {
    return mobileError(parsed.error.issues[0]?.message ?? "Please check the story details.");
  }

  const result = await createStoryForUser(user.id, parsed.data);
  if (!result.ok) {
    return mobileError(result.error);
  }
  return corsJson({ ok: true, storyId: result.storyId });
}
