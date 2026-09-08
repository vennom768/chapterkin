export const READER_LEVELS = [
  {
    id: "early",
    label: "Learn to read",
    blurb: "Short words. Easy sentences.",
  },
  {
    id: "parent",
    label: "Parent",
    blurb: "The usual bedtime read-aloud.",
  },
  {
    id: "growing",
    label: "Growing reader",
    blurb: "Richer words for practice.",
  },
] as const;

export type ReaderLevelId = (typeof READER_LEVELS)[number]["id"];

export const DEFAULT_READER_LEVEL: ReaderLevelId = "parent";
export const READER_LEVEL_STORAGE_KEY = "chapterkin_reader_level";

export function isReaderLevelId(value: string): value is ReaderLevelId {
  return READER_LEVELS.some((level) => level.id === value);
}

export type StoredTextLevels = {
  early?: string;
  growing?: string;
};

export function parseTextLevels(raw: string | null | undefined): StoredTextLevels {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const record = parsed as Record<string, unknown>;
    return {
      early:
        (typeof record.early === "string" && record.early) ||
        (typeof record.textEarly === "string" && record.textEarly) ||
        (typeof record.text_early === "string" && record.text_early) ||
        undefined,
      growing:
        (typeof record.growing === "string" && record.growing) ||
        (typeof record.textGrowing === "string" && record.textGrowing) ||
        (typeof record.text_growing === "string" && record.text_growing) ||
        undefined,
    };
  } catch {
    return {};
  }
}

export function serializeTextLevels(levels: { early: string; growing: string }) {
  return JSON.stringify({
    early: levels.early.trim(),
    growing: levels.growing.trim(),
  });
}

function normalizeForCompare(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function readerLevelsAreDistinct(
  parent: string,
  levels: StoredTextLevels,
) {
  const early = levels.early?.trim() ?? "";
  const growing = levels.growing?.trim() ?? "";
  if (!early || !growing) return false;
  const parentNorm = normalizeForCompare(parent);
  const earlyNorm = normalizeForCompare(early);
  const growingNorm = normalizeForCompare(growing);
  return (
    earlyNorm !== parentNorm &&
    growingNorm !== parentNorm &&
    earlyNorm !== growingNorm
  );
}

export function fallbackReaderLevelVariants(text: string) {
  const words = text.replace(/\s+/g, " ").trim();
  const firstWords = words
    .replace(/[.,!?]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6)
    .join(" ");
  return {
    textEarly: firstWords ? `${firstWords}.` : "They go home.",
    textGrowing: `${words} After that, the same people stayed close, the same quiet path remained, and sleep came more slowly and more surely than before.`,
  };
}

export function textForReaderLevel(
  page: { text: string; textLevels?: string | null; kind?: string | null },
  level: ReaderLevelId,
) {
  if (page.kind === "cover" || level === "parent") {
    return page.text;
  }
  const stored = parseTextLevels(page.textLevels);
  const storedText = stored[level]?.trim();
  if (
    storedText &&
    normalizeForCompare(storedText) !== normalizeForCompare(page.text)
  ) {
    return storedText;
  }
  const fallback = fallbackReaderLevelVariants(page.text);
  return level === "early" ? fallback.textEarly : fallback.textGrowing;
}

export function resolvedReaderTexts(page: {
  text: string;
  textLevels?: string | null;
  kind?: string | null;
}) {
  return {
    early: textForReaderLevel(page, "early"),
    parent: page.text,
    growing: textForReaderLevel(page, "growing"),
  };
}

export function pickReaderText(
  texts: { early: string; parent: string; growing: string },
  level: ReaderLevelId,
) {
  if (level === "parent") return texts.parent;
  const chosen = texts[level]?.trim();
  if (chosen && normalizeForCompare(chosen) !== normalizeForCompare(texts.parent)) {
    return chosen;
  }
  const fallback = fallbackReaderLevelVariants(texts.parent);
  return level === "early" ? fallback.textEarly : fallback.textGrowing;
}

export function normalizeGeneratedPageLevels(page: {
  text: string;
  textEarly?: string | null;
  textGrowing?: string | null;
}) {
  const text = page.text.trim();
  return {
    text,
    textLevels: serializeTextLevels({
      early: page.textEarly?.trim() || text,
      growing: page.textGrowing?.trim() || text,
    }),
  };
}
