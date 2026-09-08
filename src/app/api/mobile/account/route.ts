import { auth } from "@/lib/auth";
import { corsJson, corsOptions, mobileError } from "@/lib/mobile/http";
import { requireMobileUser } from "@/lib/mobile/session";

export function OPTIONS() {
  return corsOptions();
}

export async function DELETE(request: Request) {
  const { user, response } = await requireMobileUser(request);
  if (!user) return response;

  try {
    await auth.api.deleteUser({
      headers: request.headers,
      body: {},
    });
    return corsJson({ ok: true });
  } catch (error) {
    return mobileError(
      error instanceof Error ? error.message : "Could not delete this account.",
    );
  }
}
