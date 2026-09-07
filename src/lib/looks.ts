export type LookOption = { value: string; label: string };

export const HAIR_STYLES: LookOption[] = [
  { value: "curly", label: "Curly" },
  { value: "coily", label: "Coily" },
  { value: "wavy", label: "Wavy" },
  { value: "straight", label: "Straight" },
  { value: "braided", label: "Braids" },
  { value: "two puffs of", label: "Two puffs" },
  { value: "a bun of", label: "Bun" },
  { value: "a ponytail of", label: "Ponytail" },
  { value: "short", label: "Short" },
  { value: "long", label: "Long" },
];

export const HAIR_COLORS: LookOption[] = [
  { value: "black", label: "Black" },
  { value: "dark brown", label: "Dark brown" },
  { value: "brown", label: "Brown" },
  { value: "auburn", label: "Auburn" },
  { value: "red", label: "Red" },
  { value: "blonde", label: "Blonde" },
  { value: "light blonde", label: "Light blonde" },
];

export const EYE_COLORS: LookOption[] = [
  { value: "brown", label: "Brown" },
  { value: "dark brown", label: "Dark brown" },
  { value: "hazel", label: "Hazel" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "gray", label: "Gray" },
  { value: "amber", label: "Amber" },
];

export const SKIN_TONES: LookOption[] = [
  { value: "deep brown", label: "Deep brown" },
  { value: "rich brown", label: "Rich brown" },
  { value: "warm brown", label: "Warm brown" },
  { value: "golden brown", label: "Golden brown" },
  { value: "olive", label: "Olive" },
  { value: "tan", label: "Tan" },
  { value: "peach", label: "Peach" },
  { value: "fair", label: "Fair" },
  { value: "ivory", label: "Ivory" },
];

export const CLOTHES: LookOption[] = [
  { value: "cozy star pajamas", label: "Star pajamas" },
  { value: "a yellow raincoat and red boots", label: "Raincoat" },
  { value: "a striped shirt and jeans", label: "Stripes + jeans" },
  { value: "a dinosaur T-shirt", label: "Dinosaur shirt" },
  { value: "a soft hoodie", label: "Hoodie" },
  { value: "a sundress", label: "Sundress" },
  { value: "overalls", label: "Overalls" },
  { value: "a soccer jersey", label: "Soccer jersey" },
];

export function composeHair(style: string, color: string, custom: string) {
  const extra = custom.trim();
  if (extra && !style && !color) return extra;
  if (!style && !color) return extra;
  const base = [style, color, "hair"].filter(Boolean).join(" ");
  return extra ? `${base}, ${extra}` : base;
}

export function composeEyes(color: string, custom: string) {
  const extra = custom.trim();
  if (extra && !color) return extra;
  if (!color) return extra;
  return extra ? `${color} eyes, ${extra}` : `${color} eyes`;
}

export function composeSkin(tone: string, custom: string) {
  const extra = custom.trim();
  if (extra && !tone) return extra;
  if (!tone) return extra;
  return extra ? `${tone} skin, ${extra}` : `${tone} skin`;
}

export function composeClothes(preset: string, custom: string) {
  const extra = custom.trim();
  if (extra && !preset) return extra;
  if (!preset) return extra;
  return extra ? `${preset}, ${extra}` : preset;
}

export function matchLookOption(saved: string | null | undefined, options: LookOption[]) {
  if (!saved) return "";
  const lower = saved.toLowerCase();
  const exact = options.find(
    (option) => lower === option.value || lower === `${option.value} hair` || lower === `${option.value} eyes` || lower === `${option.value} skin`,
  );
  if (exact) return exact.value;
  return options.find((option) => lower.includes(option.value))?.value ?? "";
}

export function leftoverCustom(saved: string | null | undefined, used: string[]) {
  if (!saved) return "";
  let leftover = saved;
  for (const part of used.filter((item) => item.trim().length > 0)) {
    leftover = leftover.replace(new RegExp(part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), "");
  }
  return leftover
    .replace(/\b(hair|eyes|skin)\b/gi, "")
    .replace(/^[,\s]+|[,\s]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
