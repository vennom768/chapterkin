import { corsJson, corsOptions, mobileError } from "@/lib/mobile/http";
import { requireMobileUser } from "@/lib/mobile/session";
import { markStoryReadForUser } from "@/lib/services/sharing";

export function OPTIONS() {
  return corsOptions();
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireMobileUser(request);
  if (!user) return response;
  const { id } = await context.params;
  const result = await markStoryReadForUser(id, user.id);
  if (!result.ok) {
    return mobileError(result.error, 404);
  }
  return corsJson({ ok: true });
}
