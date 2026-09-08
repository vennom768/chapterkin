import { Link } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { Button, ErrorText, Field, Screen, Title } from "@/src/components/ui";
import { API_URL, authClient } from "@/src/lib/auth";
import { colors } from "@/src/lib/theme";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <Screen>
      <Title>Reset your password</Title>
      <Text style={{ color: colors.muted, fontSize: 16 }}>
        We will email a link. Open it on the website, then come back here to sign in.
      </Text>
      <Field
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <ErrorText>{error}</ErrorText>
      {sent ? (
        <Text style={{ color: colors.navy, fontWeight: "600" }}>
          If that email is on an account, the reset link is on its way.
        </Text>
      ) : null}
      <Button
        label="Send reset link"
        pending={pending}
        onPress={async () => {
          setPending(true);
          setError(null);
          const result = await authClient.requestPasswordReset({
            email,
            redirectTo: `${API_URL}/reset-password`,
          });
          setPending(false);
          if (result.error) {
            setError(result.error.message ?? "Could not send that email.");
            return;
          }
          setSent(true);
        }}
      />
      <Link href="/sign-in" style={{ color: colors.navy, fontWeight: "700" }}>
        Back to sign in
      </Link>
    </Screen>
  );
}
