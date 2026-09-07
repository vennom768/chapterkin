export type AgeBand = "toddler" | "early" | "older";

export function getAgeBand(age: number): AgeBand {
  if (age <= 4) return "toddler";
  if (age <= 7) return "early";
  return "older";
}

export function getAgeGuidance(age: number) {
  const band = getAgeBand(age);
  if (band === "toddler") {
    return {
      band,
      pages: { min: 4, max: 5 },
      wordsPerPage: { min: 25, max: 45 },
      tone: "Very short, repetitive, gentle, and concrete. Simple sentences a parent can read slowly. Soft landing into sleep.",
    };
  }
  if (band === "early") {
    return {
      band,
      pages: { min: 5, max: 6 },
      wordsPerPage: { min: 40, max: 70 },
      tone: "A simple, kind plot with a beginning, middle, and cozy end. Everyday magic is fine. Vocabulary a 5–7 year old understands when read aloud.",
    };
  }
  return {
    band,
    pages: { min: 6, max: 8 },
    wordsPerPage: { min: 55, max: 80 },
    tone: "A richer adventure that is still bedtime-safe. Clear stakes without real danger. Warm resolution and a calm last page.",
  };
}
