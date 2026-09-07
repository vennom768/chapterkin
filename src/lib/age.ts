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
      pages: { min: 8, max: 10 },
      wordsPerPage: { min: 20, max: 40 },
      tone: "Very short, repetitive, gentle, and concrete. Simple sentences a parent can read slowly. Soft landing into sleep.",
    };
  }
  if (band === "early") {
    return {
      band,
      pages: { min: 8, max: 10 },
      wordsPerPage: { min: 35, max: 60 },
      tone: "A simple, kind plot with a beginning, middle, and cozy end. Everyday magic is fine. Vocabulary a 5–7 year old understands when read aloud.",
    };
  }
  return {
    band,
    pages: { min: 8, max: 10 },
    wordsPerPage: { min: 50, max: 80 },
    tone: "A richer adventure that is still bedtime-safe. Clear stakes without real danger. Warm resolution and a calm last page.",
  };
}
