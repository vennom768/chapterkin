import { Platform, StatusBar } from "react-native";
import type { EdgeInsets } from "react-native-safe-area-context";

export function topSafeInset(insets: Pick<EdgeInsets, "top">) {
  if (insets.top > 0) return insets.top;
  if (Platform.OS === "ios") return 54;
  if (Platform.OS === "android") return StatusBar.currentHeight ?? 28;
  return 28;
}

export function bottomSafeInset(insets: Pick<EdgeInsets, "bottom">) {
  if (insets.bottom > 0) return insets.bottom;
  if (Platform.OS === "ios") return 16;
  return 12;
}
