export type StoryProvider = "mock" | "local" | "openai";

export function getStoryProvider(): StoryProvider {
  const provider = process.env.STORY_PROVIDER;
  if (provider === "mock" || provider === "local" || provider === "openai") {
    return provider;
  }
  return "openai";
}

export function isMockStoryProvider() {
  return getStoryProvider() === "mock";
}

export function isLocalStoryProvider() {
  return getStoryProvider() === "local";
}

export function ollamaBaseUrl() {
  return process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
}

export function ollamaStoryModel() {
  return process.env.OLLAMA_STORY_MODEL ?? "llama3.2";
}

export function localImageUrl() {
  return process.env.LOCAL_IMAGE_URL ?? "http://127.0.0.1:7860";
}
