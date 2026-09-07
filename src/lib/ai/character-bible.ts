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

export function buildCharacterBible(child: Child, characters: StoryPerson[]) {
  const nickname = storyName(child);
  const lines = [
    "Children's storybook illustration, watercolor gouache, warm lighting, square picture-book page, consistent characters, painted not photorealistic, no text, no letters, no watermark.",
    `Main child: ${nickname}, ${child.age} years old${nickname !== child.name ? ` (given name ${child.name})` : ""}.`,
  ];

  const appearance = [
    child.hair && `hair: ${child.hair}`,
    child.eyes && `eyes: ${child.eyes}`,
    child.skin && `skin: ${child.skin}`,
    child.usualClothes && `usually wears: ${child.usualClothes}`,
  ]
    .filter(Boolean)
    .join("; ");

  if (appearance) {
    lines.push(`Appearance: ${appearance}.`);
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
      `${character.relationship === "pet" ? "Pet" : "Person"}: ${character.name}${extras ? ` (${extras})` : ""}.`,
    );
  }

  return lines.join(" ");
}

export function describeChildForStory(child: Child, characters: StoryPerson[]) {
  const nickname = storyName(child);
  const parts = [
    `The child's given name is ${child.name}. The family calls them "${nickname}". Use "${nickname}" in the story.`,
    `Age: ${child.age}.`,
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
  if (child.hair || child.eyes || child.skin || child.usualClothes) {
    parts.push(
      `Appearance notes (for consistency, not to lecture about): ${[
        child.hair,
        child.eyes,
        child.skin,
        child.usualClothes,
      ]
        .filter(Boolean)
        .join(", ")}.`,
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
