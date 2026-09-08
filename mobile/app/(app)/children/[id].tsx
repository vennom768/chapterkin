import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { ChildFields, childPayload, emptyChildDraft } from "@/src/components/child-fields";
import { Button, ErrorText, Screen, Title } from "@/src/components/ui";
import { api } from "@/src/lib/api";
import { useSession } from "@/src/lib/session";

export default function EditChildScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { me, refresh } = useSession();
  const child = me?.children.find((item) => item.id === id);
  const initial = useMemo(() => {
    if (!child) return emptyChildDraft();
    return {
      ...emptyChildDraft(),
      name: child.name,
      calledBy: child.calledBy,
      age: String(child.age),
      ageMonths: String(child.ageMonths ?? 0),
      sex: (child.sex === "boy" ? "boy" : "girl") as "boy" | "girl",
      hair: child.hair ?? "",
      eyes: child.eyes ?? "",
      skin: child.skin ?? "",
      usualClothes: child.usualClothes ?? "",
      favoriteThings: child.favoriteThings ?? "",
      callsMom: child.callsMom ?? "",
      callsDad: child.callsDad ?? "",
      notes: child.notes ?? "",
    };
  }, [child]);
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!child) {
    return (
      <Screen>
        <Title>Child not found</Title>
      </Screen>
    );
  }

  return (
    <ScrollView>
      <Screen>
        <Title>{child.calledBy || child.name}</Title>
        <ChildFields value={draft} onChange={setDraft} />
        <ErrorText>{error}</ErrorText>
        <Button
          label="Save details"
          pending={pending}
          onPress={async () => {
            setPending(true);
            setError(null);
            try {
              await api(`/api/mobile/children/${child.id}`, {
                method: "PATCH",
                body: JSON.stringify(childPayload(draft)),
              });
              await refresh();
              router.back();
            } catch (next) {
              setError(next instanceof Error ? next.message : "Could not save.");
              setPending(false);
            }
          }}
        />
        <Button
          label="Delete child"
          variant="danger"
          onPress={() => {
            Alert.alert("Delete this child?", "Stories for them will be removed too.", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  try {
                    await api(`/api/mobile/children/${child.id}`, { method: "DELETE" });
                    await refresh();
                    router.replace("/tonight");
                  } catch (next) {
                    setError(next instanceof Error ? next.message : "Could not delete.");
                  }
                },
              },
            ]);
          }}
        />
      </Screen>
    </ScrollView>
  );
}
