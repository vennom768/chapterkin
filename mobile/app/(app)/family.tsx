import { useState } from "react";
import { ScrollView } from "react-native";
import { Button, Card, ErrorText, Field, Screen, Title } from "@/src/components/ui";
import { api } from "@/src/lib/api";
import { useSession } from "@/src/lib/session";

export default function FamilyScreen() {
  const { me, refresh } = useSession();
  const [familyName, setFamilyName] = useState(me?.family?.name ?? "");
  const [notes, setNotes] = useState(me?.family?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <ScrollView>
      <Screen>
        <Title>Family</Title>
        <Field label="Family name" value={familyName} onChangeText={setFamilyName} />
        <Field label="Notes" multiline value={notes} onChangeText={setNotes} />
        <ErrorText>{error}</ErrorText>
        <Button
          label="Save family"
          pending={pending}
          onPress={async () => {
            setPending(true);
            setError(null);
            try {
              await api("/api/mobile/family", {
                method: "PATCH",
                body: JSON.stringify({ familyName, notes }),
              });
              await refresh();
              setPending(false);
            } catch (next) {
              setError(next instanceof Error ? next.message : "Could not save.");
              setPending(false);
            }
          }}
        />
        <Card>
          {me?.family?.household.length
            ? me.family.household.map((member) => (
                <Field
                  key={member.id ?? member.name}
                  label={`${member.relationship}: ${member.name}`}
                  value={member.appearance ?? ""}
                  editable={false}
                />
              ))
            : null}
        </Card>
      </Screen>
    </ScrollView>
  );
}
