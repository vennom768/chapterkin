import * as ImagePicker from "expo-image-picker";
import { API_URL } from "@/src/lib/auth";
import { authHeaders } from "@/src/lib/api";

export type ChildPhoto = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export function photoFromAsset(asset: ImagePicker.ImagePickerAsset): ChildPhoto {
  return {
    uri: asset.uri,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
  };
}

export async function startPortraitBatch(childId: string, photo?: ChildPhoto | null) {
  const body = new FormData();
  if (photo?.uri) {
    body.append("photo", {
      uri: photo.uri,
      name: photo.fileName ?? "child.jpg",
      type: photo.mimeType ?? "image/jpeg",
    } as never);
  }
  const headers = await authHeaders();
  const response = await fetch(`${API_URL}/api/children/${childId}/portraits`, {
    method: "POST",
    headers,
    body,
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Could not start drawings.");
  }
}
