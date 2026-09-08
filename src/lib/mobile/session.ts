import { isAdminEmail, isEmailVerificationRequired } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { corsJson, mobileError } from "@/lib/mobile/http";

export async function getMobileSession(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}

export async function requireMobileUser(request: Request) {
  const session = await getMobileSession(request);
  if (!session?.user) {
    return {
      user: null,
      response: mobileError("Sign in to continue.", 401),
    };
  }

  if (
    (await isEmailVerificationRequired()) &&
    !session.user.emailVerified &&
    !isAdminEmail(session.user.email)
  ) {
    return {
      user: null,
      response: corsJson(
        {
          error: "Confirm your email before using ChapterKin.",
          code: "EMAIL_UNVERIFIED",
          email: session.user.email,
        },
        403,
      ),
    };
  }

  return { user: session.user, response: null };
}
