import { corsJson, corsOptions, mobileError } from "@/lib/mobile/http";
import { serializeSeries } from "@/lib/mobile/serialize";
import { requireMobileUser } from "@/lib/mobile/session";
import { getChildForUser, listSeriesForChild } from "@/lib/queries/children";

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
  const series = await listSeriesForChild(user.id, id);
  return corsJson({ series: series.map(serializeSeries) });
}
