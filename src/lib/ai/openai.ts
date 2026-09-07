import OpenAI from "openai";

export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local to generate stories.",
    );
  }
  return new OpenAI({ apiKey });
}

export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}
