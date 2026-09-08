import { NextResponse } from "next/server";
import { generatePortraitBatch, readTemporaryPhoto } from "@/lib/portrait-generate";
import { auth } from "@/lib/auth";
import { getChildForUser } from "@/lib/queries/children";
import { listPortraitsForChild } from "@/lib/queries/portraits";

export const maxDuration = 180;

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: _request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to see these drawings." }, { status: 401 });
  }

  const { id } = await context.params;
  const child = await getChildForUser(session.user.id, id);
  if (!child) {
    return NextResponse.json({ error: "Child profile not found." }, { status: 404 });
  }

  const portraits = await listPortraitsForChild(session.user.id, id);
  return NextResponse.json({
    portraits: portraits.map((portrait) => ({
      id: portrait.id,
      imagePath: portrait.imagePath,
      source: portrait.source,
    })),
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to draw your child." }, { status: 401 });
  }

  const { id } = await context.params;
  const child = await getChildForUser(session.user.id, id);
  if (!child) {
    return NextResponse.json({ error: "Child profile not found." }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    formData = new FormData();
  }

  let photo;
  try {
    photo = await readTemporaryPhoto(formData);
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "Could not read that photo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await generatePortraitBatch(session.user.id, child, 3, photo);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/children/[id]/portraits failed", error);
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "Could not draw these pictures. Try again in a moment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
