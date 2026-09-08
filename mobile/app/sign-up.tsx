import { router } from "expo-router";
import { ScrollView, Text } from "react-native";
import { Button, Muted, Screen, Title } from "@/src/components/ui";
import { colors } from "@/src/lib/theme";
import { openWebsite } from "@/src/lib/website";

export default function SignUpScreen() {
  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      <Screen>
        <Title>Start on the website</Title>
        <Muted>
          ChapterKin accounts begin with a paid plan. Open chapterkin.com, choose Weekly, Family, or Nightly, create
          the parent login, and pay. Then come back here and sign in with that same email.
        </Muted>
        <Text style={{ color: colors.navy, fontWeight: "700" }}>
          Kids never sign in. The app is for reading and writing after the plan is on the account.
        </Text>
        <Button label="See plans on chapterkin.com" onPress={() => openWebsite("/pricing")} />
        <Button label="I already have an account" variant="secondary" onPress={() => router.replace("/sign-in")} />
        <Button label="Back" variant="secondary" onPress={() => router.replace("/welcome")} />
      </Screen>
    </ScrollView>
  );
}
