import { Text, View } from "react-native";
import { LookBuilder } from "@/src/components/look-builder";
import { ChoiceChip, Field, Muted } from "@/src/components/ui";
import { colors } from "@/src/lib/theme";

export type ChildDraft = {
  name: string;
  calledBy: string;
  age: string;
  ageMonths: string;
  sex: "boy" | "girl" | "";
  hair: string;
  eyes: string;
  skin: string;
  usualClothes: string;
  favoriteThings: string;
  callsMom: string;
  callsDad: string;
  notes: string;
};

export function emptyChildDraft(): ChildDraft {
  return {
    name: "",
    calledBy: "",
    age: "5",
    ageMonths: "0",
    sex: "",
    hair: "",
    eyes: "",
    skin: "",
    usualClothes: "",
    favoriteThings: "",
    callsMom: "",
    callsDad: "",
    notes: "",
  };
}

export function childPayload(draft: ChildDraft) {
  const age = Number(draft.age);
  return {
    name: draft.name,
    calledBy: draft.calledBy || draft.name,
    age,
    ageMonths: age < 1 ? Number(draft.ageMonths) || 0 : null,
    sex: draft.sex === "boy" ? "boy" : "girl",
    hair: draft.hair || null,
    eyes: draft.eyes || null,
    skin: draft.skin || null,
    usualClothes: draft.usualClothes || null,
    favoriteThings: draft.favoriteThings,
    callsMom: draft.callsMom || null,
    callsDad: draft.callsDad || null,
    notes: draft.notes || null,
  };
}

export function ChildFields({
  value,
  onChange,
}: {
  value: ChildDraft;
  onChange: (next: ChildDraft) => void;
}) {
  const set = (patch: Partial<ChildDraft>) => onChange({ ...value, ...patch });
  return (
    <View style={{ gap: 16 }}>
      <Field label="Name" value={value.name} onChangeText={(name: string) => set({ name })} />
      <View style={{ gap: 6 }}>
        <Field
          label="What you call them"
          value={value.calledBy}
          onChangeText={(calledBy: string) => set({ calledBy })}
        />
        <Muted>Stories will use this name.</Muted>
      </View>
      <Field
        label="Age (years)"
        keyboardType="number-pad"
        value={value.age}
        onChangeText={(age: string) => set({ age })}
      />
      {Number(value.age) < 1 ? (
        <Field
          label="Age (months)"
          keyboardType="number-pad"
          value={value.ageMonths}
          onChangeText={(ageMonths: string) => set({ ageMonths })}
        />
      ) : null}
      <View style={{ gap: 8 }}>
        <Text style={{ color: colors.navy, fontWeight: "700", fontSize: 14 }}>Boy or girl</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["girl", "boy"] as const).map((sex) => (
            <ChoiceChip
              key={sex}
              flex
              label={sex === "girl" ? "Girl" : "Boy"}
              selected={value.sex === sex}
              onPress={() => set({ sex })}
            />
          ))}
        </View>
        <Muted>{value.sex ? `Selected: ${value.sex === "girl" ? "Girl" : "Boy"}` : "Tap Girl or Boy."}</Muted>
      </View>
      <View style={{ gap: 8 }}>
        <Text style={{ color: colors.navy, fontSize: 20, fontWeight: "700" }}>What they call their parents</Text>
        <Muted>Mommy, Mom, Mama, Daddy, Dad, Papa — whatever they actually say.</Muted>
      </View>
      <Field
        label="Mom"
        value={value.callsMom}
        onChangeText={(callsMom: string) => set({ callsMom })}
      />
      <Field
        label="Dad"
        value={value.callsDad}
        onChangeText={(callsDad: string) => set({ callsDad })}
      />
      <Field
        label="A little about them"
        multiline
        value={value.favoriteThings}
        onChangeText={(favoriteThings: string) => set({ favoriteThings })}
      />
      <View style={{ gap: 8 }}>
        <Text style={{ color: colors.navy, fontSize: 20, fontWeight: "700" }}>Build how they look</Text>
        <Muted>
          Tap face, hair, eyes, and clothes. You can also add a photo below. When you save, we draw three pictures
          and you pick the one stories should use.
        </Muted>
      </View>
      <LookBuilder
        hair={value.hair}
        eyes={value.eyes}
        skin={value.skin}
        usualClothes={value.usualClothes}
        onChange={(look) =>
          set({
            hair: look.hair,
            eyes: look.eyes,
            skin: look.skin,
            usualClothes: look.usualClothes,
          })
        }
      />
      <Field label="Anything else" multiline value={value.notes} onChangeText={(notes: string) => set({ notes })} />
    </View>
  );
}
