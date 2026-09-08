import { router } from "expo-router";
import { Alert, ScrollView, Text } from "react-native";
import { PlanCard } from "@/src/components/plan-card";
import { Button, Card, Muted, Screen, Title } from "@/src/components/ui";
import { api } from "@/src/lib/api";
import { authClient } from "@/src/lib/auth";
import { useSession } from "@/src/lib/session";
import { colors } from "@/src/lib/theme";
import { openWebsite } from "@/src/lib/website";

export default function SettingsScreen() {
  const { me, signOut } = useSession();

  return (
    <ScrollView>
      <Screen>
        <Title>Settings</Title>
        <Muted>This is a family account. Children never sign in to ChapterKin.</Muted>
        <Card>
          <Text style={{ color: colors.navy, fontWeight: "700" }}>{me?.user.name}</Text>
          <Muted>{me?.user.email}</Muted>
          <Text style={{ color: colors.navy, fontWeight: "700" }}>
            {me?.usage.paid
              ? me.usage.promo
                ? "Tester promo"
                : me.usage.planName ?? "Active plan"
              : "This account does not have a plan yet."}
          </Text>
        </Card>
        <PlanCard />
        {me?.usage.paid ? (
          <Button label="Manage plan on chapterkin.com" variant="secondary" onPress={() => openWebsite("/billing")} />
        ) : null}
        <Button
          label="Sign out"
          variant="secondary"
          onPress={async () => {
            await signOut();
            router.replace("/welcome");
          }}
        />
        <Button
          label="Delete account"
          variant="danger"
          onPress={() => {
            Alert.alert(
              "Delete account",
              "This removes the parent login, children, drawings, and remaining stories.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await api("/api/mobile/account", { method: "DELETE" });
                    } catch {
                      await authClient.deleteUser();
                    }
                    await signOut();
                    router.replace("/welcome");
                  },
                },
              ],
            );
          }}
        />
      </Screen>
    </ScrollView>
  );
}
