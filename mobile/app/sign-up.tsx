import { Link, router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text } from "react-native";
import { Button, ErrorText, Field, Screen, Title } from "@/src/components/ui";
import { authClient } from "@/src/lib/auth";
import { useSession } from "@/src/lib/session";
import { colors } from "@/src/lib/theme";

export default function SignUpScreen() {
  const { refresh } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Screen>
          <Title>Create a family account</Title>
          <Text style={{ color: colors.muted, fontSize: 16 }}>
            Parents sign in. Next you will add the kids, then open chapterkin.com
            with this same email to pick a plan.
          </Text>
          <Field label="Your name" value={name} onChangeText={setName} />
          <Field
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Field label="Password" secureTextEntry value={password} onChangeText={setPassword} />
          <Field label="Confirm password" secureTextEntry value={confirm} onChangeText={setConfirm} />
          <ErrorText>{error}</ErrorText>
          <Button
            label="Create family account"
            pending={pending}
            onPress={async () => {
              if (password !== confirm) {
                setError("Those passwords do not match.");
                return;
              }
              setPending(true);
              setError(null);
              const result = await authClient.signUp.email({ name, email, password });
              if (result.error) {
                setError(result.error.message ?? "Could not create that account.");
                setPending(false);
                return;
              }
              try {
                await refresh();
                router.replace("/onboarding");
              } catch (next) {
                setError(next instanceof Error ? next.message : "Account created. Sign in to continue.");
                setPending(false);
              }
            }}
          />
          <Link href="/sign-in" style={{ color: colors.navy, fontWeight: "700" }}>
            I already have an account
          </Link>
          <Link href="/welcome" style={{ color: colors.muted, fontWeight: "700" }}>
            Back
          </Link>
        </Screen>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
