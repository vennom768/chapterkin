import { Redirect, router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { Button, Muted, Screen, Title } from "@/src/components/ui";
import { useSession } from "@/src/lib/session";
import { colors } from "@/src/lib/theme";
import { openWebsite } from "@/src/lib/website";

export default function WelcomeScreen() {
  const { ready, me } = useSession();
  if (ready && me) {
    if (!me.usage.paid && me.needsOnboarding) {
      return <Redirect href="/tonight" />;
    }
    return <Redirect href={me.needsOnboarding ? "/onboarding" : "/tonight"} />;
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: colors.background }}>
      <Screen style={{ gap: 18 }}>
        <Text style={{ color: colors.accent, fontWeight: "800", letterSpacing: 1.2, fontSize: 13 }}>
          CHAPTERKIN
        </Text>
        <Title>A new story every night</Title>
        <Muted>
          Personalized bedtime books for your kids, with pictures that look like them. Open a sample of how it works
          here. Accounts start with a plan on chapterkin.com. Kids never need a login.
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
          <Text style={{ color: colors.navy, fontWeight: "700", fontSize: 16 }}>How a night works</Text>
          <Muted>1. You add each child, how they look, and an optional photo</Muted>
          <Muted>2. We draw three storybook pictures. You pick one. The photo is discarded</Muted>
          <Muted>3. You write tonight&apos;s story, standalone or the next chapter</Muted>
          <Muted>4. The same book can be first words, a short page, or the parent read-aloud</Muted>
        </View>
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
          <Text style={{ color: colors.navy, fontWeight: "700", fontSize: 16 }}>Try the reading levels</Text>
          <Text style={{ color: colors.navy, fontWeight: "700" }}>Learn 1</Text>
          <Muted>Maya puts on her coat.</Muted>
          <Text style={{ color: colors.navy, fontWeight: "700" }}>Learn 3</Text>
          <Muted>Maya pulled on her yellow raincoat and waited by the door.</Muted>
          <Text style={{ color: colors.navy, fontWeight: "700" }}>Parent</Text>
          <Muted>
            Maya pulled on her yellow raincoat. Biscuit trotted beside her as they followed Nana&apos;s porch light
            through the gentle rain.
          </Muted>
        </View>
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
          <Text style={{ color: colors.navy, fontWeight: "700", fontSize: 16 }}>Plans</Text>
          <Muted>A few nights · $24.99/mo · 4 stories</Muted>
          <Muted>Most weeks · $39.99/mo · 8 stories</Muted>
          <Muted>Every night · $54.99/mo · unlimited</Muted>
          <Muted>Create the parent login and pay on chapterkin.com, then sign in here.</Muted>
        </View>
        <Button label="Start on chapterkin.com" onPress={() => openWebsite("/pricing")} />
        <Button
          label="I already have an account"
          variant="secondary"
          onPress={() => router.push("/sign-in")}
        />
      </Screen>
    </ScrollView>
  );
}
