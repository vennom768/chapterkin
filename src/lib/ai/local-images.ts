import { localImageUrl } from "@/lib/ai/provider";

export async function generateLocalPng(prompt: string) {
  const response = await fetch(`${localImageUrl()}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Local image server failed (${response.status}): ${detail || "start it with npm run images:up"}`,
    );
  }

  return Buffer.from(await response.arrayBuffer());
}
