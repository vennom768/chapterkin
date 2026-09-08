import { corsJson, corsOptions, mobileError } from "@/lib/mobile/http";
import { requireMobileUser } from "@/lib/mobile/session";
import { selectPortraitForUser } from "@/lib/services/portraits";
import { z } from "zod";

export function OPTIONS() {
  return corsOptions();
}

const bodySchema = z.object({
  childId: z.string().min(1),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireMobileUser(request);
  if (!user) return response;
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return mobileError("Send the child id as JSON.");
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return mobileError("Choose a child first.");
  }

  const result = await selectPortraitForUser(user.id, parsed.data.childId, id);
  if (!result.ok) {
    return mobileError(result.error, 404);
  }
  return corsJson({ ok: true });
}
