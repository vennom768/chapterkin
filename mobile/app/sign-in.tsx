import { Link, router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text } from "react-native";
import { Button, ErrorText, Field, Screen, Title } from "@/src/components/ui";
import { authClient } from "@/src/lib/auth";
import { useSession } from "@/src/lib/session";
import { colors } from "@/src/lib/theme";

export default function SignInScreen() {
  const { refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Screen>
          <Title>Welcome back</Title>
          <Text style={{ color: colors.muted, fontSize: 16 }}>
            Sign in to your parent account.
          </Text>
          <Field
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Field
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <ErrorText>{error}</ErrorText>
          <Button
            label="Sign in"
            pending={pending}
            onPress={async () => {
              setPending(true);
              setError(null);
              const result = await authClient.signIn.email({ email, password });
              if (result.error) {
                setError(result.error.message ?? "Could not sign in.");
                setPending(false);
                return;
              }
              try {
                const me = await refresh();
                router.replace(me?.needsOnboarding ? "/onboarding" : "/tonight");
              } catch (next) {
                setError(next instanceof Error ? next.message : "Could not load your family.");
                setPending(false);
              }
            }}
          />
          <Link href="/forgot-password" style={{ color: colors.accent, fontWeight: "700" }}>
            Forgot password?
          </Link>
          <Link href="/welcome" style={{ color: colors.navy, fontWeight: "700" }}>
            See how it works
          </Link>
          <Link href="/welcome" style={{ color: colors.muted, fontWeight: "700" }}>
            Back
          </Link>
        </Screen>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
