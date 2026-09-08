import { useState } from "react";
import { ScrollView, Text } from "react-native";
import {
  HouseholdFields,
  householdFromMembers,
  householdPayload,
} from "@/src/components/household-fields";
import { Button, ErrorText, Field, Muted, Screen, Title } from "@/src/components/ui";
import { api } from "@/src/lib/api";
import { useSession } from "@/src/lib/session";
import { colors } from "@/src/lib/theme";

export default function FamilyScreen() {
  const { me, refresh } = useSession();
  const [familyName, setFamilyName] = useState(me?.family?.name ?? "");
  const [notes, setNotes] = useState(me?.family?.notes ?? "");
  const [household, setHousehold] = useState(() => householdFromMembers(me?.family?.household));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [householdPending, setHouseholdPending] = useState(false);

  return (
    <ScrollView>
      <Screen>
        <Title>Family</Title>
        <Muted>Family notes and the people or pets who show up in every book.</Muted>
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
            } catch (next) {
              setError(next instanceof Error ? next.message : "Could not save.");
            } finally {
              setPending(false);
            }
          }}
        />
        <Text style={{ color: colors.navy, fontSize: 22, fontWeight: "700" }}>Household</Text>
        <HouseholdFields value={household} onChange={setHousehold} />
        <Button
          label="Save household"
          pending={householdPending}
          onPress={async () => {
            setHouseholdPending(true);
            setError(null);
            try {
              await api("/api/mobile/family", {
                method: "PATCH",
                body: JSON.stringify({ household: householdPayload(household) }),
              });
              await refresh();
            } catch (next) {
              setError(next instanceof Error ? next.message : "Could not save household.");
            } finally {
              setHouseholdPending(false);
            }
          }}
        />
      </Screen>
    </ScrollView>
  );
}
