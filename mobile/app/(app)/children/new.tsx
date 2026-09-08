import { router } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";
import { ChildFields, childPayload, emptyChildDraft } from "@/src/components/child-fields";
import { ChildPhotoField } from "@/src/components/child-photo-field";
import { Button, ErrorText, Screen, Title } from "@/src/components/ui";
import { api } from "@/src/lib/api";
import { startPortraitBatch, type ChildPhoto } from "@/src/lib/portraits";
import { useSession } from "@/src/lib/session";

export default function NewChildScreen() {
  const { refresh } = useSession();
  const [draft, setDraft] = useState(emptyChildDraft);
  const [photo, setPhoto] = useState<ChildPhoto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <ScrollView>
      <Screen>
        <Title>Add a child</Title>
        <ChildFields value={draft} onChange={setDraft} />
        <ChildPhotoField value={photo} onChange={setPhoto} />
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
              void startPortraitBatch(result.childId, photo);
              await refresh();
              router.replace(`/children/${result.childId}/portrait?drawing=1`);
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
