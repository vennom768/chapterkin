import { corsJson, corsOptions, mobileError } from "@/lib/mobile/http";
import { serializeUsage } from "@/lib/mobile/serialize";
import { requireMobileUser } from "@/lib/mobile/session";
import { applyPromoCode } from "@/lib/promo";
import { z } from "zod";

export function OPTIONS() {
  return corsOptions();
}

const bodySchema = z.object({
  code: z.string().min(1),
});

export async function POST(request: Request) {
  const { user, response } = await requireMobileUser(request);
  if (!user) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return mobileError("Send a promo code.");
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return mobileError("Enter a promo code.");
  }

  const result = await applyPromoCode(user.id, parsed.data.code);
  if (!result.ok) {
    return mobileError(result.error);
  }
  return corsJson({ ok: true, usage: await serializeUsage(user.id) });
}
