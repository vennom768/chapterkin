import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { AppChrome } from "@/src/components/shell";
import { useSession } from "@/src/lib/session";
import { colors } from "@/src/lib/theme";

export default function AppLayout() {
  const { ready, me } = useSession();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.navy} />
      </View>
    );
  }
  if (!me) return <Redirect href="/sign-in" />;
  if (me.needsOnboarding) return <Redirect href="/onboarding" />;
  return (
    <AppChrome>
      <Slot />
    </AppChrome>
  );
}
