export const CHILD_SEX_OPTIONS = [
  { value: "boy", label: "Boy" },
  { value: "girl", label: "Girl" },
] as const;

export type ChildSex = (typeof CHILD_SEX_OPTIONS)[number]["value"];

export function isChildSex(value: string | null | undefined): value is ChildSex {
  return value === "boy" || value === "girl";
}

export function childSexStoryLine(sex?: string | null) {
  if (sex === "boy") {
    return "This child is a boy. Use he/him in the story.";
  }
  if (sex === "girl") {
    return "This child is a girl. Use she/her in the story.";
  }
  return null;
}

export function childSexArtLine(sex?: string | null) {
  if (sex === "boy") {
    return "This child is a boy.";
  }
  if (sex === "girl") {
    return "This child is a girl.";
  }
  return null;
}
