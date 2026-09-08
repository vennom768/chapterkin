export const READER_MODES = [
  {
    id: "early",
    label: "Learn to read",
    blurb: "First words up to the parent read-aloud.",
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

export const EARLY_STEPS = [
  {
    id: "early1",
    step: 1,
    label: "1",
    blurb: "First words.",
  },
  {
    id: "early2",
    step: 2,
    label: "2",
    blurb: "Short sentences.",
  },
  {
    id: "early3",
    step: 3,
    label: "3",
    blurb: "Almost parent.",
  },
] as const;

export type ReaderModeId = (typeof READER_MODES)[number]["id"];
export type EarlyStepId = (typeof EARLY_STEPS)[number]["id"];
export type ReaderLevelId = EarlyStepId | "parent" | "growing";

export const DEFAULT_READER_LEVEL: ReaderLevelId = "parent";
export const DEFAULT_EARLY_STEP: EarlyStepId = "early1";
export const READER_LEVEL_STORAGE_KEY = "chapterkin_reader_level";

export type ReaderTexts = {
  early1: string;
  early2: string;
  early3: string;
  parent: string;
  growing: string;
};

export type StoredTextLevels = {
  early1?: string;
  early2?: string;
  early3?: string;
  growing?: string;
};

export function isEarlyStepId(value: string): value is EarlyStepId {
  return EARLY_STEPS.some((step) => step.id === value);
}

export function isReaderLevelId(value: string): value is ReaderLevelId {
  return value === "parent" || value === "growing" || isEarlyStepId(value);
}

export function coerceReaderLevelId(value: string | null | undefined): ReaderLevelId | null {
  if (!value) return null;
  if (value === "early") return DEFAULT_EARLY_STEP;
  if (isReaderLevelId(value)) return value;
  return null;
}

export function readerModeId(level: ReaderLevelId): ReaderModeId {
  return isEarlyStepId(level) ? "early" : level;
}

export function parseTextLevels(raw: string | null | undefined): StoredTextLevels {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const record = parsed as Record<string, unknown>;
    const early1 =
      stringField(record, "early1", "textEarly1", "text_early_1") ||
      stringField(record, "early", "textEarly", "text_early");
    return {
      early1,
      early2: stringField(record, "early2", "textEarly2", "text_early_2"),
      early3: stringField(record, "early3", "textEarly3", "text_early_3"),
      growing: stringField(record, "growing", "textGrowing", "text_growing"),
    };
  } catch {
    return {};
  }
}

export function serializeTextLevels(levels: {
  early1: string;
  early2: string;
  early3: string;
  growing: string;
}) {
  return JSON.stringify({
    early1: levels.early1.trim(),
    early2: levels.early2.trim(),
    early3: levels.early3.trim(),
    growing: levels.growing.trim(),
  });
}

function stringField(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

function normalizeForCompare(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function endSentence(value: string) {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return "They go.";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function readerLevelsAreDistinct(
  parent: string,
  levels: StoredTextLevels,
) {
  const early1 = levels.early1?.trim() ?? "";
  const early2 = levels.early2?.trim() ?? "";
  const growing = levels.growing?.trim() ?? "";
  if (!early1 || !early2 || !growing) return false;
  const parentNorm = normalizeForCompare(parent);
  const early1Norm = normalizeForCompare(early1);
  const early2Norm = normalizeForCompare(early2);
  const growingNorm = normalizeForCompare(growing);
  return (
    early1Norm !== parentNorm &&
    early2Norm !== parentNorm &&
    growingNorm !== parentNorm &&
    early1Norm !== early2Norm &&
    early1Norm !== growingNorm &&
    early2Norm !== growingNorm
  );
}

export function fallbackReaderLevelVariants(text: string) {
  const words = text.replace(/\s+/g, " ").trim();
  const tokens = words
    .replace(/[.,!?]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  const early1 = endSentence(tokens.slice(0, 4).join(" "));
  const early2Words = tokens.slice(0, 8).join(" ");
  const early2 = endSentence(
    normalizeForCompare(early2Words) === normalizeForCompare(early1)
      ? `${early2Words} They see it`
      : early2Words || `${tokens.slice(0, 4).join(" ")} they go`,
  );
  return {
    textEarly1: early1,
    textEarly2: early2,
    textEarly3: words || early2,
    textGrowing: `${words} After that, the same people stayed close, the same quiet path remained, and sleep came more slowly and more surely than before.`,
    textEarly: early1,
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
  const storedText =
    level === "growing"
      ? stored.growing?.trim()
      : stored[level]?.trim();
  if (
    storedText &&
    (level === "early3" ||
      normalizeForCompare(storedText) !== normalizeForCompare(page.text))
  ) {
    return storedText;
  }
  const fallback = fallbackReaderLevelVariants(page.text);
  if (level === "early1") return fallback.textEarly1;
  if (level === "early2") return fallback.textEarly2;
  if (level === "early3") return fallback.textEarly3;
  return fallback.textGrowing;
}

export function resolvedReaderTexts(page: {
  text: string;
  textLevels?: string | null;
  kind?: string | null;
}): ReaderTexts {
  return {
    early1: textForReaderLevel(page, "early1"),
    early2: textForReaderLevel(page, "early2"),
    early3: textForReaderLevel(page, "early3"),
    parent: page.text,
    growing: textForReaderLevel(page, "growing"),
  };
}

export function pickReaderText(texts: ReaderTexts, level: ReaderLevelId) {
  if (level === "parent") return texts.parent;
  const chosen = texts[level]?.trim();
  if (
    chosen &&
    (level === "early3" ||
      normalizeForCompare(chosen) !== normalizeForCompare(texts.parent))
  ) {
    return chosen;
  }
  const fallback = fallbackReaderLevelVariants(texts.parent);
  if (level === "early1") return fallback.textEarly1;
  if (level === "early2") return fallback.textEarly2;
  if (level === "early3") return fallback.textEarly3;
  return fallback.textGrowing;
}

export function normalizeGeneratedPageLevels(page: {
  text: string;
  textEarly?: string | null;
  textEarly1?: string | null;
  textEarly2?: string | null;
  textEarly3?: string | null;
  textGrowing?: string | null;
}) {
  const text = page.text.trim();
  const fallback = fallbackReaderLevelVariants(text);
  return {
    text,
    textLevels: serializeTextLevels({
      early1: page.textEarly1?.trim() || page.textEarly?.trim() || fallback.textEarly1,
      early2: page.textEarly2?.trim() || fallback.textEarly2,
      early3: page.textEarly3?.trim() || fallback.textEarly3,
      growing: page.textGrowing?.trim() || fallback.textGrowing,
    }),
  };
}
