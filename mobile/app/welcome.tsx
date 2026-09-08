import { Redirect, router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { Button, Muted, Screen, Title } from "@/src/components/ui";
import { useSession } from "@/src/lib/session";
import { colors } from "@/src/lib/theme";

export default function WelcomeScreen() {
  const { ready, me } = useSession();
  if (ready && me) {
    return <Redirect href={me.needsOnboarding ? "/onboarding" : "/tonight"} />;
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: colors.background }}>
      <Screen style={{ justifyContent: "center", gap: 18 }}>
        <Text style={{ color: colors.accent, fontWeight: "800", letterSpacing: 1.2, fontSize: 13 }}>
          CHAPTERKIN
        </Text>
        <Title>A new story every night</Title>
        <Muted>
          Personalized bedtime books for your kids, with pictures that look like them. Parents sign in. Kids never
          need an account.
        </Muted>
        <View
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 18,
            gap: 10,
          }}
        >
          <Text style={{ color: colors.navy, fontWeight: "700", fontSize: 16 }}>How it works</Text>
          <Muted>1. Create a family account</Muted>
          <Muted>2. Add your kids and how they look</Muted>
          <Muted>3. Pick a plan on chapterkin.com</Muted>
          <Muted>4. Write tonight&apos;s story</Muted>
        </View>
        <Button label="Create a family account" onPress={() => router.push("/sign-up")} />
        <Button
          label="I already have an account"
          variant="secondary"
          onPress={() => router.push("/sign-in")}
        />
      </Screen>
    </ScrollView>
  );
}
