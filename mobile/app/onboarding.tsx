import { Redirect, router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { ChildFields, childPayload, emptyChildDraft, type ChildDraft } from "@/src/components/child-fields";
import { ChildPhotoField } from "@/src/components/child-photo-field";
import { HouseholdFields, householdPayload, type HouseholdDraft } from "@/src/components/household-fields";
import { Button, ErrorText, Field, Muted, Screen, Title } from "@/src/components/ui";
import { api } from "@/src/lib/api";
import { startPortraitBatch, type ChildPhoto } from "@/src/lib/portraits";
import type { Child } from "@/src/lib/types";
import { useSession } from "@/src/lib/session";
import { colors } from "@/src/lib/theme";

export default function OnboardingScreen() {
  const { me, refresh } = useSession();
  const [familyName, setFamilyName] = useState("");
  const [notes, setNotes] = useState("");
  const [kids, setKids] = useState<ChildDraft[]>([emptyChildDraft()]);
  const [photos, setPhotos] = useState<(ChildPhoto | null)[]>([null]);
  const [household, setHousehold] = useState<HouseholdDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (me && !me.usage.paid) {
    return <Redirect href="/tonight" />;
  }

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
            <ChildPhotoField
              value={photos[index] ?? null}
              onChange={(next) =>
                setPhotos((current) => current.map((item, itemIndex) => (itemIndex === index ? next : item)))
              }
            />
            {kids.length > 1 ? (
              <Button
                label="Remove this child"
                variant="secondary"
                onPress={() => {
                  setKids((current) => current.filter((_, itemIndex) => itemIndex !== index));
                  setPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index));
                }}
              />
            ) : null}
          </View>
        ))}
        <Button
          label="Add another child"
          variant="secondary"
          onPress={() => {
            setKids((current) => [...current, emptyChildDraft()]);
            setPhotos((current) => [...current, null]);
          }}
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
              const result = await api<{ children: Child[] }>("/api/mobile/family", {
                method: "POST",
                body: JSON.stringify({
                  familyName,
                  notes,
                  children: kids.map(childPayload),
                  household: householdPayload(household),
                }),
              });
              const remaining = [...(result.children ?? [])];
              let firstPortraitId: string | null = null;
              kids.forEach((kid, index) => {
                const matchIndex = remaining.findIndex(
                  (child) =>
                    child.name === kid.name.trim() &&
                    child.calledBy === (kid.calledBy.trim() || kid.name.trim()),
                );
                const child = matchIndex >= 0 ? remaining.splice(matchIndex, 1)[0] : null;
                if (child && photos[index]) {
                  void startPortraitBatch(child.id, photos[index]);
                  if (!firstPortraitId) firstPortraitId = child.id;
                }
              });
              await refresh();
              router.replace(firstPortraitId ? `/children/${firstPortraitId}/portrait?drawing=1` : "/tonight");
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
