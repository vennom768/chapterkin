import { corsJson, corsOptions, mobileError } from "@/lib/mobile/http";
import { serializeChild, serializePortraits } from "@/lib/mobile/serialize";
import { requireMobileUser } from "@/lib/mobile/session";
import { getChildForUser } from "@/lib/queries/children";
import {
  childInputSchema,
  deleteChildForUser,
  upsertChild,
} from "@/lib/services/children";

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
  const child = await getChildForUser(user.id, id);
  if (!child) {
    return mobileError("Child profile not found.", 404);
  }
  const portraits = await serializePortraits(user.id, child);
  return corsJson({ child: serializeChild(child), ...portraits });
}

export async function PATCH(
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
    return mobileError("Send the child profile as JSON.");
  }

  const parsed = childInputSchema.safeParse(body);
  if (!parsed.success) {
    return mobileError(parsed.error.issues[0]?.message ?? "Please check the profile details.");
  }

  const result = await upsertChild(user.id, parsed.data, id);
  if (!result.ok) {
    return mobileError(result.error, result.redirectTo ? 409 : 400);
  }

  const child = await getChildForUser(user.id, id);
  return corsJson({ ok: true, child: child ? serializeChild(child) : null });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireMobileUser(request);
  if (!user) return response;
  const { id } = await context.params;
  const result = await deleteChildForUser(user.id, id);
  if (!result.ok) {
    return mobileError(result.error);
  }
  return corsJson({ ok: true });
}
