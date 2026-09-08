import { router } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";
import { ChildFields, childPayload, emptyChildDraft } from "@/src/components/child-fields";
import { Button, ErrorText, Screen, Title } from "@/src/components/ui";
import { api } from "@/src/lib/api";
import { useSession } from "@/src/lib/session";

export default function NewChildScreen() {
  const { refresh } = useSession();
  const [draft, setDraft] = useState(emptyChildDraft);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <ScrollView>
      <Screen>
        <Title>Add a child</Title>
        <ChildFields value={draft} onChange={setDraft} />
        <ErrorText>{error}</ErrorText>
        <Button
          label="Save and draw three pictures"
          pending={pending}
          onPress={async () => {
            setPending(true);
            setError(null);
            try {
              const result = await api<{ childId: string }>("/api/mobile/children", {
                method: "POST",
                body: JSON.stringify(childPayload(draft)),
              });
              await refresh();
              router.replace(`/children/${result.childId}/portrait`);
            } catch (next) {
              setError(next instanceof Error ? next.message : "Could not save.");
              setPending(false);
            }
          }}
        />
      </Screen>
    </ScrollView>
  );
}
