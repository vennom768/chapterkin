import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
