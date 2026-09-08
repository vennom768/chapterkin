import { router } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";
import { Button, ErrorText, Field, Screen, Title } from "@/src/components/ui";
import { api } from "@/src/lib/api";
import { useSession } from "@/src/lib/session";

export default function OnboardingScreen() {
  const { refresh } = useSession();
  const [familyName, setFamilyName] = useState("");
  const [childName, setChildName] = useState("");
  const [calledBy, setCalledBy] = useState("");
  const [age, setAge] = useState("5");
  const [sex, setSex] = useState<"boy" | "girl">("girl");
  const [favoriteThings, setFavoriteThings] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <ScrollView style={{ flex: 1 }}>
      <Screen>
        <Title>Add the family</Title>
        <Field label="Family name" value={familyName} onChangeText={setFamilyName} />
        <Field label="First child's name" value={childName} onChangeText={setChildName} />
        <Field label="What you call them" value={calledBy} onChangeText={setCalledBy} />
        <Field label="Age" keyboardType="number-pad" value={age} onChangeText={setAge} />
        <Button
          label={sex === "girl" ? "Girl" : "Boy"}
          variant="secondary"
          onPress={() => setSex(sex === "girl" ? "boy" : "girl")}
        />
        <Field
          label="Favorite things"
          multiline
          value={favoriteThings}
          onChangeText={setFavoriteThings}
        />
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
                  children: [
                    {
                      name: childName,
                      calledBy: calledBy || childName,
                      age: Number(age),
                      sex,
                      favoriteThings,
                    },
                  ],
                  household: [],
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
