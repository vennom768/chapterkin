import { Pressable, Text, View } from "react-native";
import { LookBuilder } from "@/src/components/look-builder";
import { Button, ChoiceChip, Field, Muted } from "@/src/components/ui";
import { appearanceFromLook } from "@/src/lib/looks";
import type { HouseholdMember } from "@/src/lib/types";
import { colors } from "@/src/lib/theme";

export type HouseholdDraft = {
  name: string;
  relationship: HouseholdMember["relationship"];
  appearance: string;
  speciesOrBreed: string;
  hair: string;
  eyes: string;
  skin: string;
  usualClothes: string;
};

const RELATIONSHIPS: HouseholdDraft["relationship"][] = [
  "parent",
  "grandparent",
  "friend",
  "pet",
  "other",
];

export function emptyHouseholdMember(
  relationship: HouseholdDraft["relationship"] = "parent",
): HouseholdDraft {
  return {
    name: "",
    relationship,
    appearance: "",
    speciesOrBreed: "",
    hair: "",
    eyes: "",
    skin: "",
    usualClothes: "",
  };
}

export function householdFromMembers(members: HouseholdMember[] | undefined): HouseholdDraft[] {
  return (members ?? []).map((member) => ({
    name: member.name,
    relationship: member.relationship,
    appearance: member.appearance ?? "",
    speciesOrBreed: member.speciesOrBreed ?? "",
    hair: member.hair ?? "",
    eyes: member.eyes ?? "",
    skin: member.skin ?? "",
    usualClothes: member.usualClothes ?? "",
  }));
}

export function householdPayload(members: HouseholdDraft[]) {
  return members
    .filter((member) => member.name.trim())
    .map((member) => ({
      name: member.name.trim(),
      relationship: member.relationship,
      appearance:
        member.appearance.trim() ||
        appearanceFromLook({
          hair: member.hair,
          eyes: member.eyes,
          skin: member.skin,
          usualClothes: member.usualClothes,
        }) ||
        null,
      speciesOrBreed: member.speciesOrBreed.trim() || null,
      hair: member.hair.trim() || null,
      eyes: member.eyes.trim() || null,
      skin: member.skin.trim() || null,
      usualClothes: member.usualClothes.trim() || null,
    }));
}

export function HouseholdFields({
  value,
  onChange,
}: {
  value: HouseholdDraft[];
  onChange: (next: HouseholdDraft[]) => void;
}) {
  function add(relationship: HouseholdDraft["relationship"]) {
    onChange([...value, emptyHouseholdMember(relationship)]);
  }

  function update(index: number, patch: Partial<HouseholdDraft>) {
    onChange(value.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  return (
    <View style={{ gap: 14 }}>
      <Muted>
        Parents, grandparents, friends, and pets can be built like a child so they look the same in every book.
      </Muted>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {(["parent", "grandparent", "pet", "friend"] as const).map((relationship) => (
          <Pressable
            key={relationship}
            onPress={() => add(relationship)}
            style={{
              minHeight: 40,
              paddingHorizontal: 14,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.white,
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.navy, fontWeight: "700", textTransform: "capitalize" }}>
              Add {relationship}
            </Text>
          </Pressable>
        ))}
      </View>
      {value.map((member, index) => (
        <View
          key={`${member.relationship}-${index}`}
          style={{
            gap: 12,
            padding: 16,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.white,
          }}
        >
          <Field label="Name" value={member.name} onChangeText={(name) => update(index, { name })} />
          <Text style={{ color: colors.navy, fontWeight: "700" }}>Who they are</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {RELATIONSHIPS.map((relationship) => (
              <ChoiceChip
                key={relationship}
                label={relationship[0].toUpperCase() + relationship.slice(1)}
                selected={member.relationship === relationship}
                onPress={() => update(index, { relationship })}
              />
            ))}
          </View>
          <LookBuilder
            key={`${index}-${member.relationship}`}
            kind={member.relationship === "pet" ? "pet" : "person"}
            hair={member.hair || member.appearance}
            eyes={member.eyes}
            skin={member.skin}
            usualClothes={member.usualClothes || member.appearance}
            onChange={(look) =>
              update(index, {
                hair: look.hair,
                eyes: look.eyes,
                skin: look.skin,
                usualClothes: look.usualClothes,
                appearance: look.appearance,
                speciesOrBreed: look.speciesOrBreed,
              })
            }
          />
          <Button
            label="Remove"
            variant="secondary"
            onPress={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
          />
        </View>
      ))}
    </View>
  );
}
