"use server";

import { after } from "next/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAppUrl } from "@/lib/app-url";
import { trackEvent } from "@/lib/analytics";
import { generateChildPortraitPng, writePortraitFile } from "@/lib/ai/portraits";
import { isMockStoryProvider } from "@/lib/ai/provider";
import { db } from "@/lib/db";
import { childPortrait, childProfile, portraitPackPurchase } from "@/lib/db/schema";
import {
  PORTRAIT_PACK_CENTS,
  portraitsRemaining,
} from "@/lib/portraits";
import { getChildForUser } from "@/lib/queries/children";
import { listPortraitsForChild } from "@/lib/queries/portraits";
import { requireUser } from "@/lib/session";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { createId } from "@/lib/utils";

const PHOTO_MAX_BYTES = 6 * 1024 * 1024;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type PortraitActionResult =
  | { ok: true }
  | { ok: false; error: string; redirectTo?: string };

function revalidateChild(childId: string) {
  revalidatePath(`/children/${childId}`);
  revalidatePath(`/children/${childId}/portrait`);
  revalidatePath("/family");
  revalidatePath("/home");
}

export async function generateChildPortrait(formData: FormData): Promise<PortraitActionResult> {
  const user = await requireUser();
  const childId = String(formData.get("childId") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  const child = await getChildForUser(user.id, childId);
  if (!child) {
    return { ok: false, error: "Child profile not found." };
  }

  const existing = await listPortraitsForChild(user.id, childId);
  if (portraitsRemaining(existing.length, child.portraitPacks) <= 0) {
    return {
      ok: false,
      error: "Those three drawings are used. Buy three more to keep iterating.",
    };
  }

  const photo = formData.get("photo");
  let photoRef:
    | { buffer: Buffer; mime: string; filename: string }
    | undefined;
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > PHOTO_MAX_BYTES) {
      return { ok: false, error: "That photo is too large. Use a picture under 6 MB." };
    }
    if (!PHOTO_TYPES.has(photo.type)) {
      return { ok: false, error: "Use a JPG, PNG, or WebP photo." };
    }
    photoRef = {
      buffer: Buffer.from(await photo.arrayBuffer()),
      mime: photo.type,
      filename: "parent-photo-temp",
    };
  }

  try {
    const png = await generateChildPortraitPng(child, {
      note,
      photo: photoRef,
    });
    const id = createId();
    const imagePath = await writePortraitFile(id, png, isMockStoryProvider());
    await db.insert(childPortrait).values({
      id,
      childId,
      userId: user.id,
      imagePath,
      source: photoRef ? "photo" : "builder",
      note,
      createdAt: new Date(),
    });
    if (!child.selectedPortraitId) {
      await db
        .update(childProfile)
        .set({ selectedPortraitId: id, updatedAt: new Date() })
        .where(eq(childProfile.id, childId));
    }
    after(() =>
      trackEvent("portrait_generated", {
        userId: user.id,
        properties: { childId, source: photoRef ? "photo" : "builder" },
      }),
    );
    revalidateChild(childId);
    return { ok: true };
  } finally {
    photoRef = undefined;
  }
}

export async function selectChildPortrait(childId: string, portraitId: string) {
  const user = await requireUser();
  const child = await getChildForUser(user.id, childId);
  if (!child) {
    throw new Error("Child profile not found.");
  }
  const [portrait] = await db
    .select()
    .from(childPortrait)
    .where(
      and(
        eq(childPortrait.id, portraitId),
        eq(childPortrait.childId, childId),
        eq(childPortrait.userId, user.id),
      ),
    )
    .limit(1);
  if (!portrait) {
    throw new Error("That drawing was not found.");
  }
  await db
    .update(childProfile)
    .set({ selectedPortraitId: portraitId, updatedAt: new Date() })
    .where(eq(childProfile.id, childId));
  after(() =>
    trackEvent("portrait_selected", {
      userId: user.id,
      properties: { childId, portraitId },
    }),
  );
  revalidateChild(childId);
}

export async function startPortraitPackCheckout(childId: string) {
  const user = await requireUser();
  const child = await getChildForUser(user.id, childId);
  if (!child) {
    return { ok: false as const, error: "Child profile not found." };
  }
  if (!isStripeConfigured()) {
    return { ok: false as const, error: "Payments are not configured yet." };
  }
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false as const, error: "Payments are not configured yet." };
  }

  const purchaseId = createId();
  await db.insert(portraitPackPurchase).values({
    id: purchaseId,
    userId: user.id,
    childId,
    amountCents: PORTRAIT_PACK_CENTS,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: {
        kind: "portrait_pack",
        purchaseId,
        userId: user.id,
        childId,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: PORTRAIT_PACK_CENTS,
            product_data: {
              name: "ChapterKin · 3 more child drawings",
              description: `Three more drawings to iterate on ${child.calledBy || child.name}.`,
              tax_code: "txcd_10103000",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${getAppUrl()}/children/${childId}/portrait?packed=1`,
      cancel_url: `${getAppUrl()}/children/${childId}/portrait`,
    });
    if (!session.url) {
      return { ok: false as const, error: "Stripe did not return a checkout URL." };
    }
    await db
      .update(portraitPackPurchase)
      .set({ stripeSessionId: session.id, updatedAt: new Date() })
      .where(eq(portraitPackPurchase.id, purchaseId));
    return { ok: true as const, url: session.url };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Could not start checkout.",
    };
  }
}

export async function fulfillPortraitPack(purchaseId: string) {
  const [purchase] = await db
    .select()
    .from(portraitPackPurchase)
    .where(eq(portraitPackPurchase.id, purchaseId))
    .limit(1);
  if (!purchase || purchase.status === "complete") {
    return;
  }

  const [child] = await db
    .select()
    .from(childProfile)
    .where(eq(childProfile.id, purchase.childId))
    .limit(1);
  if (!child) {
    await db
      .update(portraitPackPurchase)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(portraitPackPurchase.id, purchaseId));
    return;
  }

  await db
    .update(childProfile)
    .set({
      portraitPacks: (child.portraitPacks ?? 0) + 1,
      updatedAt: new Date(),
    })
    .where(eq(childProfile.id, child.id));
  await db
    .update(portraitPackPurchase)
    .set({ status: "complete", updatedAt: new Date() })
    .where(eq(portraitPackPurchase.id, purchaseId));
  after(() =>
    trackEvent("portrait_pack_purchased", {
      userId: purchase.userId,
      properties: { childId: purchase.childId },
    }),
  );
  revalidateChild(child.id);
}
