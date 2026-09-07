import { ollamaBaseUrl, ollamaStoryModel } from "@/lib/ai/provider";

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1] ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("The local story model did not return JSON.");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as unknown;
}

export async function ollamaJsonChat(system: string, user: string) {
  const response = await fetch(`${ollamaBaseUrl()}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ollamaStoryModel(),
      stream: false,
      format: "json",
      options: {
        temperature: 0.8,
        num_ctx: 8192,
      },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Ollama story generation failed (${response.status}): ${detail || "is Ollama running?"}`,
    );
  }

  const payload = (await response.json()) as {
    message?: { content?: string };
  };
  const content = payload.message?.content;
  if (!content) {
    throw new Error("Ollama returned an empty story.");
  }
  return extractJson(content);
}
