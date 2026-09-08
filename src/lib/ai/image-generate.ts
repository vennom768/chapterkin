import { storyImageFallbackModel, storyImageModel } from "@/lib/ai/models";
import { getOpenAI } from "@/lib/ai/openai";

export type ImageReference = {
  buffer: Buffer;
  mime?: string;
  filename?: string;
};

async function imageBufferFromResult(result: {
  data?: Array<{ b64_json?: string | null; url?: string | null }> | null;
}) {
  const b64 = result.data?.[0]?.b64_json;
  if (b64) {
    return Buffer.from(b64, "base64");
  }
  const url = result.data?.[0]?.url;
  if (url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to download generated image");
    }
    return Buffer.from(await response.arrayBuffer());
  }
  return null;
}

function referenceFile(reference: ImageReference) {
  return new File(
    [new Uint8Array(reference.buffer)],
    reference.filename ?? "reference.png",
    { type: reference.mime ?? "image/png" },
  );
}

// Photos stay in memory only. We never upload them to OpenAI Files.
// gpt-image-1 / gpt-image-1-mini image calls are Zero Data Retention compatible.
export async function generateImagePng(
  prompt: string,
  reference?: ImageReference,
): Promise<Buffer> {
  const openai = getOpenAI();
  const models = [storyImageModel(), storyImageFallbackModel()].filter(
    (model, index, list) => list.indexOf(model) === index,
  );

  let lastError: unknown;
  for (const model of models) {
    try {
      const result = reference
        ? await openai.images.edit({
            model,
            image: referenceFile(reference),
            prompt,
            size: "1024x1024",
            quality: "medium",
          })
        : await openai.images.generate({
            model,
            prompt,
            size: "1024x1024",
            quality: "medium",
          });
      const buffer = await imageBufferFromResult(result);
      if (buffer) {
        return buffer;
      }
    } catch (error) {
      lastError = error;
      console.error("Image generate failed", model, error);
    }
  }

  if (reference) {
    return generateImagePng(prompt);
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Image model did not return image data");
}
