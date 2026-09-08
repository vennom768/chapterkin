import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "@/src/lib/session";
import { colors } from "@/src/lib/theme";

export default function Index() {
  const { ready, me } = useSession();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.navy} />
      </View>
    );
  }
  if (!me) return <Redirect href="/welcome" />;
  if (me.needsOnboarding && me.usage.paid) return <Redirect href="/onboarding" />;
  return <Redirect href="/tonight" />;
}
