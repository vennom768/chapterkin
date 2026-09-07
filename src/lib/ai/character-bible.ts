import { formatAge } from "@/lib/age";
import { bookArtBible } from "@/lib/illustration-styles";
import type { childProfile } from "@/lib/db/schema";

type Child = typeof childProfile.$inferSelect;

export type StoryPerson = {
  name: string;
  relationship: string;
  appearance?: string | null;
  speciesOrBreed?: string | null;
};

export function storyName(child: Pick<Child, "name" | "calledBy">) {
  return child.calledBy.trim() || child.name;
}

export function childAppearanceLine(child: Pick<Child, "hair" | "eyes" | "skin" | "usualClothes">) {
  return [child.hair, child.eyes, child.skin, child.usualClothes].filter(Boolean).join(", ");
}

export function buildCharacterBible(
  child: Child,
  characters: StoryPerson[],
  styleId?: string | null,
) {
  const nickname = storyName(child);
  const lines = [
    bookArtBible(styleId),
    `Main child, keep this exact look on every page including the cover: ${nickname}, ${formatAge(child.age, child.ageMonths)}${nickname !== child.name ? ` (given name ${child.name})` : ""}.`,
  ];

  const appearance = childAppearanceLine(child);
  if (appearance) {
    lines.push(`Appearance, do not change: ${appearance}.`);
  }

  for (const character of characters) {
    const extras = [
      character.relationship,
      character.speciesOrBreed,
      character.appearance,
    ]
      .filter(Boolean)
      .join(", ");
    lines.push(
      `${character.relationship === "pet" ? "Pet" : "Person"}: ${character.name}${extras ? ` (${extras})` : ""}. Keep this look if they appear.`,
    );
  }

  return lines.join(" ");
}

export function describeChildForStory(child: Child, characters: StoryPerson[]) {
  const nickname = storyName(child);
  const parts = [
    `The child's given name is ${child.name}. The family calls them "${nickname}". Use "${nickname}" in the story.`,
    `Age: ${formatAge(child.age, child.ageMonths)}.`,
  ];
  if (child.callsMom) {
    parts.push(`They call their mom "${child.callsMom}". Use that word, not "mother".`);
  }
  if (child.callsDad) {
    parts.push(`They call their dad "${child.callsDad}". Use that word, not "father".`);
  }
  if (child.favoriteThings) {
    parts.push(`A little about them: ${child.favoriteThings}.`);
  }
  if (child.notes) {
    parts.push(`Parent notes: ${child.notes}.`);
  }
  const appearance = childAppearanceLine(child);
  if (appearance) {
    parts.push(
      `Appearance notes (for consistency, not to lecture about): ${appearance}.`,
    );
  }
  if (characters.length) {
    parts.push(
      "People and pets from this family (use only these extra people/pets; do not invent additional family members):",
    );
    for (const character of characters) {
      parts.push(
        `- ${character.name}, ${character.relationship}${character.speciesOrBreed ? `, ${character.speciesOrBreed}` : ""}${character.appearance ? `, ${character.appearance}` : ""}`,
      );
    }
  } else {
    parts.push(
      "No siblings or other household people/pets were listed. Do not invent extra family members.",
    );
  }
  return parts.join("\n");
}

export function coverImagePrompt(title: string, childName: string) {
  return `FRONT COVER of this one children's picture book. The painted title on the cover reads exactly: "${title}". ${childName} is the hero, centered and inviting. Square hardcover. No barcode, no price, no publisher logo, no extra captions besides the title.`;
}

export function interiorImagePrompt(scene: string) {
  return `INTERIOR PAGE of the SAME printed book as the cover. Same illustrator and character design. Scene: ${scene}. No text, no letters, no title, no watermark.`;
}
