import * as WebBrowser from "expo-web-browser";
import { API_URL } from "@/src/lib/auth";

export function websiteUrl(path: string) {
  const next = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${next}`;
}

export async function openWebsite(path: string) {
  await WebBrowser.openBrowserAsync(websiteUrl(path), {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
  });
}
