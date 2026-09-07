import { storyName, type StoryPerson } from "@/lib/ai/character-bible";
import type { childProfile, storySeries } from "@/lib/db/schema";

type Child = typeof childProfile.$inferSelect;
type Series = typeof storySeries.$inferSelect;

type MockInput = {
  child: Child;
  characters: StoryPerson[];
  mode: "standalone" | "series";
  theme?: string | null;
  dailyPrompt?: string | null;
  series?: Series | null;
};

function parentLine(child: Child) {
  const names = [child.callsMom, child.callsDad].filter(Boolean) as string[];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return names[0] ?? "someone who loves them";
}

function siblingLine(characters: StoryPerson[]) {
  const siblings = characters.filter((person) => person.relationship === "sibling");
  if (!siblings.length) return null;
  if (siblings.length === 1) return siblings[0].name;
  return `${siblings
    .slice(0, -1)
    .map((person) => person.name)
    .join(", ")} and ${siblings.at(-1)?.name}`;
}

export function generateMockStory(input: MockInput) {
  const child = input.child;
  const name = storyName(child);
  const parents = parentLine(child);
  const sibling = siblingLine(input.characters);
  const today = input.dailyPrompt?.trim();
  const about = child.favoriteThings?.trim();
  const theme = input.theme || "cozy";
  const chapter =
    input.mode === "series" && input.series
      ? (input.series.lastChapterNumber ?? 0) + 1
      : input.mode === "series"
        ? 1
        : null;

  const title = today
    ? `${name} and the day of ${today.slice(0, 28)}`
    : theme === "adventure"
      ? `${name} and the porch-light path`
      : `${name}'s bedtime lantern`;

  const pages = [
    {
      text: `${name} wriggled under the quilt. ${parents} sat close. ${about ? `${name} had been thinking about ${about}. ` : ""}${today ? `Today, ${today}. ` : ""}The house grew quiet, the kind of quiet that means a story is about to start.`,
      imagePrompt: `${name} in bed with ${parents} nearby, warm lamp light`,
    },
    {
      text: `${sibling ? `${sibling} peeked in, then padded closer. ` : ""}Together they imagined a small path behind the house, just wide enough for little feet. ${name} whispered, "Don't go too far," the way ${parents} always said it, and then they went exactly far enough.`,
      imagePrompt: `${name}${sibling ? ` and ${sibling}` : ""} on a moonlit garden path`,
    },
    {
      text: `A lantern beetle blinked once, twice, and waited. ${name} followed it past the fence, past the sleepy flowers, all the way to a hill that looked like a tucked-in blanket. Nothing scary lived there. Only crickets practicing their goodnights.`,
      imagePrompt: `storybook hill at dusk with a tiny lantern beetle and ${name}`,
    },
    {
      text: `${today ? `The beetle showed ${name} a picture of the day — ${today} — shining like a pebble you keep in a pocket. ` : ""}${name} smiled. The day could stay. It did not have to be done over. It could just be a story now.`,
      imagePrompt: `${name} holding a glowing pebble of the day's memory`,
    },
    {
      text: `"Time to come home," said ${parents}, the way they always did. ${name} took the path back, ${sibling ? `hand in hand with ${sibling}, ` : ""}and the lantern beetle stayed on the hill to wait for another night.`,
      imagePrompt: `${name} walking home toward porch light with ${parents}`,
    },
    {
      text: `They sat on the hill and counted three quiet things: the wind, a far-away dog, and their own breathing. ${name} decided the day had been enough.`,
      imagePrompt: `${name} sitting on a soft hill counting quiet things`,
    },
    {
      text: `The beetle blinked a last time, like a tiny porch light. ${sibling ? `${sibling} yawned first. ` : ""}${name} yawned bigger.`,
      imagePrompt: `tiny lantern beetle blinking near ${name}`,
    },
    {
      text: `Back in bed, ${name} was already half-asleep. ${parents} pulled the quilt to ${name}'s chin. "Tomorrow can wait," they said. ${name} nodded, and the room filled up with ordinary, perfect dark.`,
      imagePrompt: `${name} asleep, quilt tucked, night-light glow`,
    },
    {
      text: `"I will remember the hill," ${name} murmured. ${parents} said they would remember it too. Then there was only the quilt, and sleep.`,
      imagePrompt: `${name} almost asleep, whispering about the hill`,
    },
  ];

  const used = pages;
  const seriesTitle =
    input.series?.title ||
    (input.mode === "series" ? `The lantern nights of ${name}` : title);

  return {
    title: chapter ? `${title} (chapter ${chapter})` : title,
    seriesTitle,
    synopsis: `${name} followed a gentle lantern-path after a day with ${parents}${today ? `, remembering ${today}` : ""}, and came home ready for sleep.`,
    seriesSummary: `${name}'s lantern-beetle world. Recurring people: ${parents}${sibling ? `, ${sibling}` : ""}. A hill behind the house waits for the next night.`,
    pages: used,
  };
}
