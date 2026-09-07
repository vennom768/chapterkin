export function storyTextModel() {
  return process.env.STORY_TEXT_MODEL?.trim() || "gpt-4o-mini";
}

export function storyImageModel() {
  return process.env.STORY_IMAGE_MODEL?.trim() || "gpt-image-1-mini";
}

export function storyImageFallbackModel() {
  return process.env.STORY_IMAGE_FALLBACK_MODEL?.trim() || "gpt-image-1";
}
