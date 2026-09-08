import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { ChildFields, childPayload, emptyChildDraft, type ChildDraft } from "@/src/components/child-fields";
import { HouseholdFields, householdPayload, type HouseholdDraft } from "@/src/components/household-fields";
import { Button, ErrorText, Field, Muted, Screen, Title } from "@/src/components/ui";
import { api } from "@/src/lib/api";
import { useSession } from "@/src/lib/session";
import { colors } from "@/src/lib/theme";

export default function OnboardingScreen() {
  const { refresh } = useSession();
  const [familyName, setFamilyName] = useState("");
  const [notes, setNotes] = useState("");
  const [kids, setKids] = useState<ChildDraft[]>([emptyChildDraft()]);
  const [household, setHousehold] = useState<HouseholdDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen>
        <Title>Add the family</Title>
        <Muted>Name the household, then add kids the same way you would on the website.</Muted>
        <Field label="Family name" value={familyName} onChangeText={setFamilyName} />
        <Field label="Anything about your household" multiline value={notes} onChangeText={setNotes} />
        {kids.map((kid, index) => (
          <View key={index} style={{ gap: 12, marginTop: 8 }}>
            <Text style={{ color: colors.navy, fontSize: 22, fontWeight: "700" }}>
              {index === 0 ? "First child" : `Child ${index + 1}`}
            </Text>
            <ChildFields
              value={kid}
              onChange={(next) =>
                setKids((current) => current.map((item, itemIndex) => (itemIndex === index ? next : item)))
              }
            />
            {kids.length > 1 ? (
              <Button
                label="Remove this child"
                variant="secondary"
                onPress={() => setKids((current) => current.filter((_, itemIndex) => itemIndex !== index))}
              />
            ) : null}
          </View>
        ))}
        <Button
          label="Add another child"
          variant="secondary"
          onPress={() => setKids((current) => [...current, emptyChildDraft()])}
        />
        <Text style={{ color: colors.navy, fontSize: 22, fontWeight: "700" }}>Parents, grandparents, pets</Text>
        <HouseholdFields value={household} onChange={setHousehold} />
        <ErrorText>{error}</ErrorText>
        <Button
          label="Save family"
          pending={pending}
          onPress={async () => {
            setPending(true);
            setError(null);
            try {
              await api("/api/mobile/family", {
                method: "POST",
                body: JSON.stringify({
                  familyName,
                  notes,
                  children: kids.map(childPayload),
                  household: householdPayload(household),
                }),
              });
              await refresh();
              router.replace("/tonight");
            } catch (next) {
              setError(next instanceof Error ? next.message : "Could not save the family.");
              setPending(false);
            }
          }}
        />
      </Screen>
    </ScrollView>
  );
}
