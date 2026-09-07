"use server";

import { after } from "next/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAppUrl } from "@/lib/app-url";
import { isAdminEmail, isEmailVerificationRequired } from "@/lib/admin";
import { illustrateStory } from "@/lib/ai/images";
import { generateRevisedPages } from "@/lib/ai/revisions";
import { db } from "@/lib/db";
import { pageRevision, story, storyPage } from "@/lib/db/schema";
import { PAGE_REVISION_CENTS, revisionPrice } from "@/lib/plans";
import { getStoryForUser } from "@/lib/queries/stories";
import { getCurrentUser } from "@/lib/session";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { createId } from "@/lib/utils";

const requestSchema = z.object({
  storyId: z.string().min(1),
  pageIds: z.array(z.string().min(1)).min(1).max(12),
  instruction: z.string().min(4).max(800),
});

export type RevisionCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string; redirectTo?: string };

export async function startPageRevisionCheckout(input: {
  storyId: string;
  pageIds: string[];
  instruction: string;
}): Promise<RevisionCheckoutResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Sign in to continue.", redirectTo: "/sign-in" };
  }
  if (
    (await isEmailVerificationRequired()) &&
    !user.emailVerified &&
    !isAdminEmail(user.email)
  ) {
    return {
      ok: false,
      error: "Confirm your email first.",
      redirectTo: `/check-email?email=${encodeURIComponent(user.email)}`,
    };
  }

  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Choose at least one page and say what to change." };
  }

  const current = await getStoryForUser(user.id, parsed.data.storyId);
  if (!current) {
    return { ok: false, error: "That story was not found." };
  }

  const ownedIds = new Set(current.pages.map((page) => page.id));
  const pageIds = parsed.data.pageIds.filter((id) => ownedIds.has(id));
  if (!pageIds.length) {
    return { ok: false, error: "Choose pages from this story." };
  }

  if (!isStripeConfigured()) {
    return { ok: false, error: "Payments are not configured yet." };
  }
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, error: "Payments are not configured yet." };
  }

  const amountCents = revisionPrice(pageIds.length);
  const revisionId = createId();
  await db.insert(pageRevision).values({
    id: revisionId,
    userId: user.id,
    storyId: parsed.data.storyId,
    pageIds: JSON.stringify(pageIds),
    instruction: parsed.data.instruction.trim(),
    amountCents,
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
        kind: "page_revision",
        revisionId,
        userId: user.id,
        storyId: parsed.data.storyId,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: `ChapterKin page revision · ${pageIds.length} page${pageIds.length === 1 ? "" : "s"}`,
              description: `Rewrite and redraw selected pages of ${current.story.title}.`,
              tax_code: "txcd_10103000",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${getAppUrl()}/stories/${parsed.data.storyId}?revised=paid`,
      cancel_url: `${getAppUrl()}/stories/${parsed.data.storyId}/edit`,
    });
    if (!session.url) {
      return { ok: false, error: "Stripe did not return a checkout URL." };
    }
    await db
      .update(pageRevision)
      .set({ stripeSessionId: session.id, updatedAt: new Date() })
      .where(eq(pageRevision.id, revisionId));
    return { ok: true, url: session.url };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not start checkout.",
    };
  }
}

export async function fulfillPageRevision(revisionId: string) {
  const [revision] = await db
    .select()
    .from(pageRevision)
    .where(eq(pageRevision.id, revisionId))
    .limit(1);
  if (!revision || revision.status === "complete") {
    return;
  }

  const pageIds = z.array(z.string()).parse(JSON.parse(revision.pageIds));
  const current = await getStoryForUser(revision.userId, revision.storyId);
  if (!current) {
    await db
      .update(pageRevision)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(pageRevision.id, revisionId));
    return;
  }

  await db
    .update(pageRevision)
    .set({ status: "paid", updatedAt: new Date() })
    .where(eq(pageRevision.id, revisionId));

  let rewritten: Awaited<ReturnType<typeof generateRevisedPages>>;
  try {
    rewritten = await generateRevisedPages({
      title: current.story.title,
      childName: current.child.calledBy || current.child.name,
      instruction: revision.instruction,
      pages: current.pages,
      selectedIds: pageIds,
    });
  } catch {
    await db
      .update(pageRevision)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(pageRevision.id, revisionId));
    return;
  }

  for (const page of rewritten) {
    await db
      .update(storyPage)
      .set({
        text: page.text,
        imagePrompt: page.imagePrompt,
        imagePath: null,
        imageStatus: "pending",
      })
      .where(
        and(eq(storyPage.id, page.pageId), eq(storyPage.storyId, revision.storyId)),
      );
  }

  if (rewritten.some((page) => {
    const original = current.pages.find((item) => item.id === page.pageId);
    return original?.kind === "cover";
  })) {
    const cover = rewritten.find((page) => {
      const original = current.pages.find((item) => item.id === page.pageId);
      return original?.kind === "cover";
    });
    if (cover?.text) {
      await db
        .update(story)
        .set({ title: cover.text })
        .where(eq(story.id, revision.storyId));
    }
  }

  await db
    .update(pageRevision)
    .set({ status: "complete", updatedAt: new Date() })
    .where(eq(pageRevision.id, revisionId));

  after(() => illustrateStory(revision.storyId, pageIds));
  revalidatePath(`/stories/${revision.storyId}`);
  revalidatePath("/library");
  revalidatePath("/home");
}

export async function markRevisionPaidBySession(sessionId: string, revisionId?: string) {
  if (revisionId) {
    await fulfillPageRevision(revisionId);
    return;
  }
  const [revision] = await db
    .select()
    .from(pageRevision)
    .where(eq(pageRevision.stripeSessionId, sessionId))
    .limit(1);
  if (revision) {
    await fulfillPageRevision(revision.id);
  }
}
