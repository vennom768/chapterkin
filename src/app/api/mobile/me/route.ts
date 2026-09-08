import { corsJson, corsOptions } from "@/lib/mobile/http";
import {
  serializeChild,
  serializeFamily,
  serializeUsage,
} from "@/lib/mobile/serialize";
import { requireMobileUser } from "@/lib/mobile/session";
import { getFamilyWithMembers } from "@/lib/queries/family";

export function OPTIONS() {
  return corsOptions();
}

export async function GET(request: Request) {
  const { user, response } = await requireMobileUser(request);
  if (!user) return response;

  const household = await getFamilyWithMembers(user.id);
  const usage = await serializeUsage(user.id);

  return corsJson({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    },
    usage,
    family: household
      ? serializeFamily(household.family, household.household)
      : null,
    children: household ? household.children.map(serializeChild) : [],
    needsOnboarding: !household || household.children.length === 0,
  });
}
