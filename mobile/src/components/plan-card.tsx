import { useState } from "react";
import { Text } from "react-native";
import { Button, Card, ErrorText, Field, Muted } from "@/src/components/ui";
import { api } from "@/src/lib/api";
import { useSession } from "@/src/lib/session";
import { colors } from "@/src/lib/theme";
import { openWebsite } from "@/src/lib/website";

export function PlanCard() {
  const { me, refresh } = useSession();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [opening, setOpening] = useState(false);

  if (!me || me.usage.paid) return null;

  return (
    <Card>
      <Text style={{ color: colors.navy, fontSize: 22, fontWeight: "700" }}>Start tonight&apos;s stories</Text>
      <Muted>
        Plans live on chapterkin.com. Sign in there with this same email, then pick a plan. Weekly is $24.99 for 4
        stories, Family is $39.99 for 8, and Nightly is $54.99 unlimited.
      </Muted>
      <Text style={{ color: colors.navy, fontWeight: "700" }}>{me.user.email}</Text>
      <Field label="Have a promo code?" value={code} onChangeText={setCode} autoCapitalize="characters" />
      <ErrorText>{error}</ErrorText>
      <Button
        label="Apply promo"
        variant="secondary"
        pending={pending}
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
          } catch (next) {
            setError(next instanceof Error ? next.message : "Could not apply that code.");
          } finally {
            setPending(false);
          }
        }}
      />
      <Button
        label="Continue on chapterkin.com"
        pending={opening}
        onPress={async () => {
          setOpening(true);
          try {
            await openWebsite("/pricing");
          } finally {
            setOpening(false);
            await refresh();
          }
        }}
      />
    </Card>
  );
}
