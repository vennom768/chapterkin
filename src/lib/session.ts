import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminEmail, isEmailVerificationRequired } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { getFamilyWithMembers } from "@/lib/queries/family";

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }
  if (
    (await isEmailVerificationRequired()) &&
    !user.emailVerified &&
    !isAdminEmail(user.email)
  ) {
    redirect(`/check-email?email=${encodeURIComponent(user.email)}`);
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdminEmail(user.email)) {
    redirect("/home");
  }
  return user;
}

export async function requireFamily() {
  const user = await requireUser();
  const household = await getFamilyWithMembers(user.id);
  if (!household || household.children.length === 0) {
    redirect("/onboarding");
  }
  return { user, ...household };
}
