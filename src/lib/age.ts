export type AgeBand = "infant" | "toddler" | "early" | "older";

export function getAgeBand(age: number, ageMonths?: number | null): AgeBand {
  if (age < 1) return "infant";
  if (age <= 4) return "toddler";
  if (age <= 7) return "early";
  return "older";
}

export function formatAge(age: number, ageMonths?: number | null) {
  if (age < 1) {
    const months = ageMonths ?? 0;
    if (months <= 0) return "Newborn";
    if (months === 1) return "1 month";
    return `${months} months`;
  }
  return age === 1 ? "1 year" : `${age} years`;
}

export function getAgeGuidance(age: number, ageMonths?: number | null) {
  const band = getAgeBand(age, ageMonths);
  if (band === "infant") {
    const newborn = (ageMonths ?? 0) <= 3;
    return {
      band,
      pages: { min: 8, max: 10 },
      wordsPerPage: { min: 8, max: 20 },
      tone: newborn
        ? "A lullaby for a newborn. Soft sounds, faces, warmth, and sleep. Almost no plot. A parent should be able to murmur it."
        : "A very gentle baby book. Simple sensory moments, repetition, and a calm landing into sleep. No adventure or danger.",
    };
  }
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
