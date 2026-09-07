export type LookOption = { value: string; label: string; color?: string };

export const HAIR_STYLES: LookOption[] = [
  { value: "short", label: "Short" },
  { value: "long", label: "Long" },
  { value: "curly", label: "Curly" },
  { value: "coily", label: "Coily" },
  { value: "wavy", label: "Wavy" },
  { value: "straight", label: "Straight" },
  { value: "braided", label: "Braids" },
  { value: "two puffs of", label: "Two puffs" },
  { value: "a bun of", label: "Bun" },
  { value: "a ponytail of", label: "Ponytail" },
];

export const HAIR_COLORS: LookOption[] = [
  { value: "black", label: "Black", color: "#1a1410" },
  { value: "dark brown", label: "Dark brown", color: "#3b2416" },
  { value: "brown", label: "Brown", color: "#6b3f22" },
  { value: "auburn", label: "Auburn", color: "#8a3a1b" },
  { value: "red", label: "Red", color: "#c24620" },
  { value: "blonde", label: "Blonde", color: "#d4a45a" },
  { value: "light blonde", label: "Light blonde", color: "#f0d48a" },
];

export const EYE_COLORS: LookOption[] = [
  { value: "brown", label: "Brown", color: "#5c3317" },
  { value: "dark brown", label: "Dark brown", color: "#2b160c" },
  { value: "hazel", label: "Hazel", color: "#8a6b32" },
  { value: "green", label: "Green", color: "#3f7a3a" },
  { value: "blue", label: "Blue", color: "#3a6ea8" },
  { value: "gray", label: "Gray", color: "#7a838c" },
  { value: "amber", label: "Amber", color: "#c4842a" },
];

export const SKIN_TONES: LookOption[] = [
  { value: "deep brown", label: "Deep brown", color: "#3b2216" },
  { value: "rich brown", label: "Rich brown", color: "#5c3317" },
  { value: "warm brown", label: "Warm brown", color: "#8d5524" },
  { value: "golden brown", label: "Golden brown", color: "#c68642" },
  { value: "olive", label: "Olive", color: "#c3a36b" },
  { value: "tan", label: "Tan", color: "#d8a56a" },
  { value: "peach", label: "Peach", color: "#f0c7a0" },
  { value: "fair", label: "Fair", color: "#f3d5bd" },
  { value: "ivory", label: "Ivory", color: "#fae7d4" },
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

export const PET_SPECIES: LookOption[] = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "bunny", label: "Bunny" },
  { value: "hamster", label: "Hamster" },
  { value: "bird", label: "Bird" },
  { value: "fish", label: "Fish" },
  { value: "horse", label: "Horse" },
  { value: "guinea pig", label: "Guinea pig" },
];

export const PET_COLORS: LookOption[] = [
  { value: "black", label: "Black", color: "#1a1410" },
  { value: "brown", label: "Brown", color: "#6b3f22" },
  { value: "golden", label: "Golden", color: "#d4a45a" },
  { value: "orange", label: "Orange", color: "#d46a2a" },
  { value: "white", label: "White", color: "#f4efe6" },
  { value: "gray", label: "Gray", color: "#8a8380" },
  { value: "spotted", label: "Spotted", color: "#c4b49a" },
  { value: "tabby", label: "Tabby", color: "#b57a3a" },
];

export const PET_SIZES: LookOption[] = [
  { value: "tiny", label: "Tiny" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "big", label: "Big" },
];

export type PersonLook = {
  hair: string;
  eyes: string;
  skin: string;
  usualClothes: string;
};

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

export function composePersonLook(look: {
  hairStyle: string;
  hairColor: string;
  hairExtra: string;
  eyeColor: string;
  eyeExtra: string;
  skinTone: string;
  skinExtra: string;
  clothes: string;
  clothesExtra: string;
}): PersonLook {
  return {
    hair: composeHair(look.hairStyle, look.hairColor, look.hairExtra),
    eyes: composeEyes(look.eyeColor, look.eyeExtra),
    skin: composeSkin(look.skinTone, look.skinExtra),
    usualClothes: composeClothes(look.clothes, look.clothesExtra),
  };
}

export function composePetLook(species: string, color: string, size: string, extra: string) {
  const parts = [size, color, species].filter(Boolean);
  const base = parts.join(" ");
  const note = extra.trim();
  if (note && !base) return note;
  return note ? `${base}, ${note}` : base;
}

export function appearanceFromLook(look: PersonLook) {
  return [look.hair, look.eyes, look.skin, look.usualClothes].filter(Boolean).join(", ");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function matchLookOption(saved: string | null | undefined, options: LookOption[]) {
  if (!saved) return "";
  const lower = saved.toLowerCase();
  const ranked = [...options].sort((a, b) => b.value.length - a.value.length);
  for (const option of ranked) {
    const token = escapeRegExp(option.value);
    if (
      new RegExp(`(?:^|[\\s,])${token}(?:$|[\\s,]| hair| eyes| skin)`, "i").test(lower)
    ) {
      return option.value;
    }
  }
  return "";
}

export function leftoverCustom(saved: string | null | undefined, used: string[]) {
  if (!saved) return "";
  let leftover = saved;
  for (const part of used.filter((item) => item.trim().length > 0)) {
    leftover = leftover.replace(new RegExp(escapeRegExp(part), "ig"), "");
  }
  return leftover
    .replace(/\b(hair|eyes|skin)\b/gi, "")
    .replace(/^[,\s]+|[,\s]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
