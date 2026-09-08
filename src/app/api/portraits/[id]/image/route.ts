import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { storageImagePath } from "@/lib/ai/portraits";
import { getPortraitForUser } from "@/lib/queries/portraits";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const portrait = await getPortraitForUser(session.user.id, id);
  if (!portrait?.imagePath) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filename = path.basename(portrait.imagePath);
  const data = await readFile(storageImagePath(filename));
  const contentType = filename.endsWith(".svg") ? "image/svg+xml" : "image/png";
  return new NextResponse(data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
