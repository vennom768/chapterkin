"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ADMIN_VIEW_COOKIE } from "@/lib/admin";
import { db } from "@/lib/db";
import { siteSetting } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/session";

export async function setAdminViewMode(mode: "admin" | "parent") {
  await requireAdmin();
  const jar = await cookies();
  jar.set(ADMIN_VIEW_COOKIE, mode, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 180,
  });
  redirect(mode === "parent" ? "/home" : "/admin");
}

export async function updateSiteSetting(key: string, value: string) {
  await requireAdmin();
  if (key !== "require_email_verification" || (value !== "true" && value !== "false")) {
    throw new Error("That setting cannot be changed.");
  }
  const now = new Date();
  const [existing] = await db
    .select()
    .from(siteSetting)
    .where(eq(siteSetting.key, key))
    .limit(1);
  if (existing) {
    await db
      .update(siteSetting)
      .set({ value, updatedAt: now })
      .where(eq(siteSetting.key, key));
  } else {
    await db.insert(siteSetting).values({ key, value, updatedAt: now });
  }
  redirect("/admin");
}
