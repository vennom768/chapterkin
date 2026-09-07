import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSetting } from "@/lib/db/schema";

export const ADMIN_VIEW_COOKIE = "chapterkin_view";

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

export async function getAdminViewMode(): Promise<"admin" | "parent"> {
  const jar = await cookies();
  return jar.get(ADMIN_VIEW_COOKIE)?.value === "parent" ? "parent" : "admin";
}

export async function getSiteSetting(key: string) {
  try {
    const [row] = await db
      .select()
      .from(siteSetting)
      .where(eq(siteSetting.key, key))
      .limit(1);
    return row?.value ?? null;
  } catch {
    return null;
  }
}

export async function isEmailVerificationRequired() {
  const stored = await getSiteSetting("require_email_verification");
  if (stored === "true") return true;
  if (stored === "false") return false;
  return process.env.REQUIRE_EMAIL_VERIFICATION !== "false";
}
