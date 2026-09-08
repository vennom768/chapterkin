import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text } from "react-native";
import { Button, Card, ErrorText, Field, Muted, Screen, Title } from "@/src/components/ui";
import { api } from "@/src/lib/api";
import { authClient } from "@/src/lib/auth";
import { useSession } from "@/src/lib/session";
import { colors } from "@/src/lib/theme";

export default function SettingsScreen() {
  const { me, refresh, signOut } = useSession();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
        <Field label="Promo code" value={code} onChangeText={setCode} autoCapitalize="characters" />
        <ErrorText>{error}</ErrorText>
        <Button
          label="Apply promo"
          pending={pending}
          variant="secondary"
          onPress={async () => {
            setPending(true);
            setError(null);
            try {
              await api("/api/mobile/promo", {
                method: "POST",
                body: JSON.stringify({ code }),
              });
              await refresh();
              setCode("");
              setPending(false);
            } catch (next) {
              setError(next instanceof Error ? next.message : "Could not apply that code.");
              setPending(false);
            }
          }}
        />
        <Button
          label="Sign out"
          variant="secondary"
          onPress={async () => {
            await signOut();
            router.replace("/sign-in");
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
                    router.replace("/sign-in");
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
