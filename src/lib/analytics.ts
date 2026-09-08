import { db } from "@/lib/db";
import { analyticsEvent } from "@/lib/db/schema";
import { createId } from "@/lib/utils";

export async function trackEvent(
  name: string,
  input?: { userId?: string | null; properties?: Record<string, unknown> },
) {
  try {
    await db.insert(analyticsEvent).values({
      id: createId(),
      userId: input?.userId ?? null,
      name,
      properties: input?.properties ? JSON.stringify(input.properties) : null,
      createdAt: new Date(),
    });
  } catch {
    // Analytics must never break the parent flow.
  }
}
