import { corsJson, corsOptions, mobileError } from "@/lib/mobile/http";
import { serializeChild, serializeFamily } from "@/lib/mobile/serialize";
import { requireMobileUser } from "@/lib/mobile/session";
import { getFamilyForUser, getFamilyWithMembers } from "@/lib/queries/family";
import {
  householdDraftSchema,
  onboardingSchema,
  createFamilyOnboarding,
  replaceHousehold,
  updateFamilyDetails,
} from "@/lib/services/family";
import { z } from "zod";

export function OPTIONS() {
  return corsOptions();
}

export async function GET(request: Request) {
  const { user, response } = await requireMobileUser(request);
  if (!user) return response;
  const household = await getFamilyWithMembers(user.id);
  if (!household) {
    return mobileError("Finish family setup first.", 404, { code: "NEEDS_ONBOARDING" });
  }
  return corsJson(serializeFamily(household.family, household.household));
}

const patchSchema = z.object({
  familyName: z.string().min(1).max(80).optional(),
  notes: z.string().max(600).optional().nullable(),
  household: z.array(householdDraftSchema).max(16).optional(),
});

export async function POST(request: Request) {
  const { user, response } = await requireMobileUser(request);
  if (!user) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return mobileError("Send family details as JSON.");
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return mobileError(parsed.error.issues[0]?.message ?? "Please check your family details.");
  }

  const result = await createFamilyOnboarding(user.id, parsed.data);
  if (!result.ok) {
    return mobileError(result.error, result.redirectTo ? 409 : 400);
  }
  const household = await getFamilyWithMembers(user.id);
  return corsJson({
    ok: true,
    family: household ? serializeFamily(household.family, household.household) : null,
    children: household ? household.children.map(serializeChild) : [],
  });
}

export async function PATCH(request: Request) {
  const { user, response } = await requireMobileUser(request);
  if (!user) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return mobileError("Send family details as JSON.");
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return mobileError(parsed.error.issues[0]?.message ?? "Please check your family details.");
  }

  if (parsed.data.familyName !== undefined || parsed.data.notes !== undefined) {
    const current = await getFamilyForUser(user.id);
    const result = await updateFamilyDetails(user.id, {
      familyName: parsed.data.familyName ?? current?.name ?? "",
      notes: parsed.data.notes,
    });
    if (!result.ok) {
      return mobileError(result.error, result.redirectTo ? 409 : 400);
    }
  }

  if (parsed.data.household) {
    const result = await replaceHousehold(user.id, parsed.data.household);
    if (!result.ok) {
      return mobileError(result.error, result.redirectTo ? 409 : 400);
    }
  }

  const household = await getFamilyWithMembers(user.id);
  if (!household) {
    return mobileError("Finish family setup first.", 404, { code: "NEEDS_ONBOARDING" });
  }
  return corsJson(serializeFamily(household.family, household.household));
}
