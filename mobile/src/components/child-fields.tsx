import { Pressable, Text, View } from "react-native";
import { Field } from "@/src/components/ui";
import { colors } from "@/src/lib/theme";

export type ChildDraft = {
  name: string;
  calledBy: string;
  age: string;
  ageMonths: string;
  sex: "boy" | "girl";
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
    sex: "girl",
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
    sex: draft.sex,
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
    <View style={{ gap: 12 }}>
      <Field label="Name" value={value.name} onChangeText={(name: string) => set({ name })} />
      <Field
        label="What you call them"
        value={value.calledBy}
        onChangeText={(calledBy: string) => set({ calledBy })}
      />
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
      <View style={{ flexDirection: "row", gap: 8 }}>
        {(["girl", "boy"] as const).map((sex) => (
          <Pressable
            key={sex}
            onPress={() => set({ sex })}
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: value.sex === sex ? colors.navy : colors.white,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: value.sex === sex ? colors.gold : colors.navy, fontWeight: "700" }}>
              {sex === "girl" ? "Girl" : "Boy"}
            </Text>
          </Pressable>
        ))}
      </View>
      <Field label="Hair" value={value.hair} onChangeText={(hair: string) => set({ hair })} />
      <Field label="Eyes" value={value.eyes} onChangeText={(eyes: string) => set({ eyes })} />
      <Field label="Skin" value={value.skin} onChangeText={(skin: string) => set({ skin })} />
      <Field
        label="Usual clothes"
        value={value.usualClothes}
        onChangeText={(usualClothes: string) => set({ usualClothes })}
      />
      <Field
        label="Favorite things"
        multiline
        value={value.favoriteThings}
        onChangeText={(favoriteThings: string) => set({ favoriteThings })}
      />
      <Field
        label="What they call mom"
        value={value.callsMom}
        onChangeText={(callsMom: string) => set({ callsMom })}
      />
      <Field
        label="What they call dad"
        value={value.callsDad}
        onChangeText={(callsDad: string) => set({ callsDad })}
      />
      <Field label="Notes" multiline value={value.notes} onChangeText={(notes: string) => set({ notes })} />
    </View>
  );
}
