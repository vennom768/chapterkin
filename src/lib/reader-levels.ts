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
      early: typeof record.early === "string" ? record.early : undefined,
      growing: typeof record.growing === "string" ? record.growing : undefined,
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

export function textForReaderLevel(
  page: { text: string; textLevels?: string | null; kind?: string | null },
  level: ReaderLevelId,
) {
  if (page.kind === "cover" || level === "parent") {
    return page.text;
  }
  const stored = parseTextLevels(page.textLevels);
  return stored[level]?.trim() || page.text;
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
