export const ILLUSTRATION_STYLES = {
  watercolor: {
    id: "watercolor",
    name: "Watercolor",
    blurb: "Soft painted pages, like a classic picture book.",
    bible:
      "Children's picture-book illustration in watercolor gouache. Warm lamp-lit palette, visible paper grain, gentle brush edges, painted not photorealistic.",
  },
  cartoon: {
    id: "cartoon",
    name: "Cartoon",
    blurb: "Friendly bold shapes and clean outlines.",
    bible:
      "Children's cartoon picture-book illustration. Soft rounded shapes, clean outlines, flat cozy colors, expressive but never scary, not photorealistic, not 3D CGI.",
  },
  crayon: {
    id: "crayon",
    name: "Crayon",
    blurb: "Waxy crayon and colored-pencil textures.",
    bible:
      "Children's picture-book illustration that looks drawn in crayon and colored pencil on cream paper. Soft waxy texture, handmade, warm, not photorealistic.",
  },
  collage: {
    id: "collage",
    name: "Collage",
    blurb: "Cut-paper layers and cozy textures.",
    bible:
      "Children's picture-book collage illustration. Cut paper, fabric scraps, and painted shapes layered on a page. Handmade, tactile, warm, not photorealistic.",
  },
  vintage: {
    id: "vintage",
    name: "Vintage",
    blurb: "Mid-century storybook charm.",
    bible:
      "Vintage mid-century children's picture-book illustration. Limited warm ink-and-wash palette, classic storybook charm, printed on cream paper, not photorealistic.",
  },
  ink: {
    id: "ink",
    name: "Ink wash",
    blurb: "Ink lines with a quiet wash of color.",
    bible:
      "Children's picture-book illustration in ink line and light watercolor wash. Quiet, elegant, bedtime-soft, not photorealistic.",
  },
} as const;

export type IllustrationStyleId = keyof typeof ILLUSTRATION_STYLES;

export const DEFAULT_ILLUSTRATION_STYLE: IllustrationStyleId = "watercolor";

export function isIllustrationStyleId(value: string): value is IllustrationStyleId {
  return value in ILLUSTRATION_STYLES;
}

export function getIllustrationStyle(value?: string | null) {
  if (value && isIllustrationStyleId(value)) {
    return ILLUSTRATION_STYLES[value];
  }
  return ILLUSTRATION_STYLES[DEFAULT_ILLUSTRATION_STYLE];
}

export function bookArtBible(styleId?: string | null) {
  const style = getIllustrationStyle(styleId);
  return [
    `ONE printed children's picture book. Every page is by the same illustrator, in the same ${style.name.toLowerCase()} style, with the same character faces, hair, clothes, proportions, and color palette.`,
    style.bible,
    "Square page. Warm lighting. Consistent characters from page to page. Do not change art style, medium, character design, or the child's age.",
  ].join(" ");
}
