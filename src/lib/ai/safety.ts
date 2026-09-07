import { getOpenAI, hasOpenAIKey } from "@/lib/ai/openai";
import { isLocalStoryProvider, isMockStoryProvider } from "@/lib/ai/provider";

const BLOCKED_PATTERNS = [
  /\b(kill|murder|suicide|self[- ]?harm|rape|molest|porn|nude|naked|sex|sexual|erotic)\b/i,
  /\b(gun|shoot|stab|blood|gore|torture|abuse|kidnap)\b/i,
  /\b(cocaine|heroin|meth|fentanyl|overdose)\b/i,
  /\b(nazi|kkk|terrorist)\b/i,
];

export type SafetyResult =
  | { ok: true }
  | { ok: false; reason: string };

export function localPromptSafety(text: string | undefined | null): SafetyResult {
  if (!text?.trim()) {
    return { ok: true };
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return {
        ok: false,
        reason:
          "That note includes something we cannot weave into a children's bedtime story. Try a gentler detail from the day.",
      };
    }
  }

  return { ok: true };
}

export async function checkPromptSafety(
  ...texts: Array<string | undefined | null>
): Promise<SafetyResult> {
  const combined = texts.filter((value) => value?.trim()).join("\n");
  const local = localPromptSafety(combined);
  if (!local.ok) {
    return local;
  }
  if (!combined || isMockStoryProvider() || isLocalStoryProvider() || !hasOpenAIKey()) {
    return { ok: true };
  }

  try {
    const openai = getOpenAI();
    const moderation = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: combined,
    });
    const flagged = moderation.results.some((result) => result.flagged);
    if (flagged) {
      return {
        ok: false,
        reason:
          "That note was flagged as not appropriate for a children's story. Please rephrase with a kinder, everyday detail.",
      };
    }
  } catch {
    // If moderation is unavailable, local checks still apply.
  }

  return { ok: true };
}
