import { eq } from "drizzle-orm";
import {
  generateReaderLevelVariants,
  pageHasDistinctLevels,
} from "@/lib/ai/reader-variants";
import { db } from "@/lib/db";
import { storyPage } from "@/lib/db/schema";
import {
  fallbackReaderLevelVariants,
  normalizeGeneratedPageLevels,
} from "@/lib/reader-levels";

export async function ensureStoryReaderLevels<
  T extends {
    id: string;
    kind: string;
    text: string;
    textLevels?: string | null;
  },
>(pages: T[]) {
  const interiors = pages.filter((page) => page.kind !== "cover");
  if (interiors.length === 0 || interiors.every(pageHasDistinctLevels)) {
    return pages;
  }

  let variants: Array<{ textEarly: string; textGrowing: string }>;
  try {
    variants = await generateReaderLevelVariants(
      interiors.map((page) => page.text),
    );
  } catch {
    variants = interiors.map((page) => fallbackReaderLevelVariants(page.text));
  }

  await Promise.all(
    interiors.map(async (page, index) => {
      const levels = normalizeGeneratedPageLevels({
        text: page.text,
        textEarly: variants[index]?.textEarly,
        textGrowing: variants[index]?.textGrowing,
      });
      page.textLevels = levels.textLevels;
      try {
        await db
          .update(storyPage)
          .set({ textLevels: levels.textLevels })
          .where(eq(storyPage.id, page.id));
      } catch {
        // Keep the in-memory variants even if the column is not ready yet.
      }
    }),
  );

  return pages;
}
