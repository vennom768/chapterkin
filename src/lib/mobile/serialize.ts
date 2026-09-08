import { formatAge } from "@/lib/age";
import { getUsage } from "@/lib/billing";
import { planStoryLabel } from "@/lib/plans";
import { portraitsRemaining } from "@/lib/portraits";
import { listPortraitsForChild } from "@/lib/queries/portraits";
import { resolvedReaderTexts } from "@/lib/reader-levels";
import {
  childProfile,
  family,
  householdMember,
  story,
  storyPage,
  storySeries,
} from "@/lib/db/schema";

type Child = typeof childProfile.$inferSelect;
type Family = typeof family.$inferSelect;
type Household = typeof householdMember.$inferSelect;
type Story = typeof story.$inferSelect;
type Page = typeof storyPage.$inferSelect;
type Series = typeof storySeries.$inferSelect;

export function serializeChild(child: Child) {
  return {
    id: child.id,
    name: child.name,
    calledBy: child.calledBy,
    age: child.age,
    ageMonths: child.ageMonths,
    ageLabel: formatAge(child.age, child.ageMonths),
    sex: child.sex,
    hair: child.hair,
    eyes: child.eyes,
    skin: child.skin,
    usualClothes: child.usualClothes,
    favoriteThings: child.favoriteThings,
    callsMom: child.callsMom,
    callsDad: child.callsDad,
    notes: child.notes,
    selectedPortraitId: child.selectedPortraitId,
    portraitPacks: child.portraitPacks ?? 0,
  };
}

export function serializeFamily(current: Family, household: Household[]) {
  return {
    id: current.id,
    name: current.name,
    notes: current.notes,
    household: household.map((member) => ({
      id: member.id,
      name: member.name,
      relationship: member.relationship,
      appearance: member.appearance,
      speciesOrBreed: member.speciesOrBreed,
      hair: member.hair,
      eyes: member.eyes,
      skin: member.skin,
      usualClothes: member.usualClothes,
    })),
  };
}

export async function serializeUsage(userId: string) {
  const usage = await getUsage(userId);
  return {
    paid: usage.paid,
    promo: usage.promo,
    planId: usage.planId,
    planName: usage.plan?.name ?? null,
    planLabel: usage.plan ? planStoryLabel(usage.plan.storiesPerMonth) : null,
    used: usage.used,
    limit: usage.limit,
    remaining: Number.isFinite(usage.remaining) ? usage.remaining : null,
    unlimited: usage.limit == null,
    canGenerate: usage.canGenerate,
  };
}

export async function serializePortraits(userId: string, child: Child) {
  const portraits = await listPortraitsForChild(userId, child.id);
  return {
    remaining: portraitsRemaining(portraits.length, child.portraitPacks ?? 0),
    portraits: portraits.map((portrait) => ({
      id: portrait.id,
      imagePath: `/api/portraits/${portrait.id}/image`,
      source: portrait.source,
      selected: portrait.id === child.selectedPortraitId,
    })),
  };
}

export function serializeStorySummary(input: {
  story: Story;
  childName: string | null;
  seriesTitle: string | null;
  cover: { id: string; imageStatus: string; imagePath: string | null } | null;
}) {
  return {
    id: input.story.id,
    title: input.story.title,
    childId: input.story.childId,
    childName: input.childName,
    seriesId: input.story.seriesId,
    seriesTitle: input.seriesTitle,
    chapterNumber: input.story.chapterNumber,
    mode: input.story.mode,
    status: input.story.status,
    createdAt: input.story.createdAt.toISOString(),
    coverImagePath: input.cover?.id ? `/api/pages/${input.cover.id}/image` : null,
    coverImageStatus: input.cover?.imageStatus ?? "pending",
  };
}

export function serializeStoryDetail(input: {
  story: Story;
  child: Child;
  series: Series | null;
  pages: Page[];
}) {
  return {
    id: input.story.id,
    title: input.story.title,
    childId: input.child.id,
    childName: input.child.calledBy || input.child.name,
    seriesId: input.story.seriesId,
    seriesTitle: input.series?.title ?? null,
    chapterNumber: input.story.chapterNumber,
    mode: input.story.mode,
    status: input.story.status,
    shareToken: input.story.shareToken,
    illustrationStyle: input.story.illustrationStyle,
    pages: input.pages.map((page) => ({
      id: page.id,
      pageIndex: page.pageIndex,
      kind: page.kind,
      text: page.text,
      texts: resolvedReaderTexts(page),
      imageStatus: page.imageStatus,
      imagePath: page.imagePath ? `/api/pages/${page.id}/image` : null,
    })),
  };
}

export function serializeSeries(series: Series) {
  return {
    id: series.id,
    title: series.title,
    childId: series.childId,
    lastChapterNumber: series.lastChapterNumber,
  };
}
