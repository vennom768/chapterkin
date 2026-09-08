import { corsJson, corsOptions, mobileError } from "@/lib/mobile/http";
import { serializeChild } from "@/lib/mobile/serialize";
import { requireMobileUser } from "@/lib/mobile/session";
import { listChildren } from "@/lib/queries/children";
import { childInputSchema, upsertChild } from "@/lib/services/children";

export function OPTIONS() {
  return corsOptions();
}

export async function GET(request: Request) {
  const { user, response } = await requireMobileUser(request);
  if (!user) return response;
  const children = await listChildren(user.id);
  return corsJson({ children: children.map(serializeChild) });
}

export async function POST(request: Request) {
  const { user, response } = await requireMobileUser(request);
  if (!user) return response;

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

  const result = await upsertChild(user.id, parsed.data);
  if (!result.ok) {
    return mobileError(result.error, result.redirectTo ? 409 : 400);
  }

  const children = await listChildren(user.id);
  const child = children.find((item) => item.id === result.childId);
  return corsJson({
    ok: true,
    created: result.created,
    childId: result.childId,
    child: child ? serializeChild(child) : null,
  });
}
