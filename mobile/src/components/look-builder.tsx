import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Field } from "@/src/components/ui";
import {
  appearanceFromLook,
  CLOTHES,
  composePersonLook,
  composePetLook,
  EYE_COLORS,
  HAIR_COLORS,
  HAIR_STYLES,
  leftoverCustom,
  matchLookOption,
  PET_COLORS,
  PET_SIZES,
  PET_SPECIES,
  SKIN_TONES,
  type LookOption,
  type PersonLook,
} from "@/src/lib/looks";
import { colors } from "@/src/lib/theme";

export type LookChange = PersonLook & { appearance: string; speciesOrBreed: string };

function SwatchRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: LookOption[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: colors.navy, fontWeight: "700", fontSize: 14 }}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(selected ? "" : option.value)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                minHeight: 40,
                paddingHorizontal: 12,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: selected ? colors.accent : colors.border,
                backgroundColor: selected ? "rgba(232, 184, 109, 0.35)" : colors.white,
              }}
            >
              {option.color ? (
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 999,
                    backgroundColor: option.color,
                    borderWidth: 1,
                    borderColor: "rgba(0,0,0,0.12)",
                  }}
                />
              ) : null}
              <Text style={{ color: colors.navy, fontWeight: "700", fontSize: 13 }}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function AvatarPreview({
  skin,
  hair,
  eyes,
  pet,
}: {
  skin: string;
  hair: string;
  eyes: string;
  pet?: boolean;
}) {
  const skinColor = SKIN_TONES.find((item) => item.value === skin)?.color ?? "#f0c7a0";
  const hairColor = HAIR_COLORS.find((item) => item.value === hair)?.color ?? "#6b3f22";
  const eyeColor = EYE_COLORS.find((item) => item.value === eyes)?.color ?? "#5c3317";
  const petColor = PET_COLORS.find((item) => item.value === hair)?.color ?? "#6b3f22";

  if (pet) {
    return (
      <View
        style={{
          alignItems: "center",
          paddingVertical: 20,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: "#fbf6ee",
        }}
      >
        <View style={{ width: 96, height: 72, borderRadius: 32, backgroundColor: petColor }} />
        <Text style={{ marginTop: 10, color: colors.navy, fontWeight: "700" }}>Pet look</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        alignItems: "center",
        paddingVertical: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: "#fbf6ee",
      }}
    >
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: skinColor,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        <View style={{ width: 36, height: 10, borderRadius: 8, backgroundColor: hair ? hairColor : "transparent", marginBottom: 10 }} />
        <View style={{ flexDirection: "row", gap: 18 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: eyeColor }} />
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: eyeColor }} />
        </View>
      </View>
      <Text style={{ marginTop: 10, color: colors.navy, fontWeight: "700" }}>Avatar preview</Text>
    </View>
  );
}

export function LookBuilder({
  hair,
  eyes,
  skin,
  usualClothes,
  kind = "person",
  onChange,
}: {
  hair?: string | null;
  eyes?: string | null;
  skin?: string | null;
  usualClothes?: string | null;
  kind?: "person" | "pet";
  onChange: (look: LookChange) => void;
}) {
  const [hairStyle, setHairStyle] = useState(() =>
    kind === "pet" ? matchLookOption(usualClothes ?? hair, PET_SIZES) : matchLookOption(hair, HAIR_STYLES),
  );
  const [hairColor, setHairColor] = useState(() =>
    kind === "pet"
      ? matchLookOption(usualClothes ?? hair ?? eyes, PET_COLORS)
      : matchLookOption(hair, HAIR_COLORS),
  );
  const [hairExtra, setHairExtra] = useState(() =>
    leftoverCustom(hair, [matchLookOption(hair, HAIR_STYLES), matchLookOption(hair, HAIR_COLORS), "hair"]),
  );
  const [eyeColor, setEyeColor] = useState(() =>
    kind === "pet"
      ? matchLookOption(usualClothes ?? hair, PET_SPECIES)
      : matchLookOption(eyes, EYE_COLORS),
  );
  const [eyeExtra, setEyeExtra] = useState(() => leftoverCustom(eyes, [matchLookOption(eyes, EYE_COLORS), "eyes"]));
  const [skinTone, setSkinTone] = useState(() => matchLookOption(skin, SKIN_TONES));
  const [skinExtra, setSkinExtra] = useState(() => leftoverCustom(skin, [matchLookOption(skin, SKIN_TONES), "skin"]));
  const [clothes, setClothes] = useState(() => matchLookOption(usualClothes, CLOTHES));
  const [clothesExtra, setClothesExtra] = useState(() =>
    leftoverCustom(usualClothes, [
      matchLookOption(usualClothes, CLOTHES),
      matchLookOption(usualClothes, PET_SPECIES),
      matchLookOption(usualClothes, PET_COLORS),
      matchLookOption(usualClothes, PET_SIZES),
    ]),
  );
  const [showExtras, setShowExtras] = useState(() =>
    Boolean(
      leftoverCustom(hair, [matchLookOption(hair, HAIR_STYLES), matchLookOption(hair, HAIR_COLORS), "hair"]) ||
        leftoverCustom(eyes, [matchLookOption(eyes, EYE_COLORS), "eyes"]) ||
        leftoverCustom(skin, [matchLookOption(skin, SKIN_TONES), "skin"]) ||
        leftoverCustom(usualClothes, [matchLookOption(usualClothes, CLOTHES)]),
    ),
  );

  const composed = useMemo(() => {
    if (kind === "pet") {
      const usual = composePetLook(eyeColor, hairColor, hairStyle, clothesExtra);
      return {
        hair: "",
        eyes: "",
        skin: "",
        usualClothes: usual,
        appearance: usual,
        speciesOrBreed: eyeColor || clothesExtra.trim(),
      };
    }
    const look = composePersonLook({
      hairStyle,
      hairColor,
      hairExtra,
      eyeColor,
      eyeExtra,
      skinTone,
      skinExtra,
      clothes,
      clothesExtra,
    });
    return { ...look, appearance: appearanceFromLook(look), speciesOrBreed: "" };
  }, [
    clothes,
    clothesExtra,
    eyeColor,
    eyeExtra,
    hairColor,
    hairExtra,
    hairStyle,
    kind,
    skinExtra,
    skinTone,
  ]);

  function emit(
    next: Partial<{
      hairStyle: string;
      hairColor: string;
      hairExtra: string;
      eyeColor: string;
      eyeExtra: string;
      skinTone: string;
      skinExtra: string;
      clothes: string;
      clothesExtra: string;
    }>,
  ) {
    const merged = {
      hairStyle,
      hairColor,
      hairExtra,
      eyeColor,
      eyeExtra,
      skinTone,
      skinExtra,
      clothes,
      clothesExtra,
      ...next,
    };
    if (kind === "pet") {
      const usual = composePetLook(
        next.eyeColor ?? eyeColor,
        next.hairColor ?? hairColor,
        next.hairStyle ?? hairStyle,
        next.clothesExtra ?? clothesExtra,
      );
      onChange({
        hair: "",
        eyes: "",
        skin: "",
        usualClothes: usual,
        appearance: usual,
        speciesOrBreed: (next.eyeColor ?? eyeColor) || (next.clothesExtra ?? clothesExtra).trim(),
      });
      return;
    }
    const look = composePersonLook(merged);
    onChange({ ...look, appearance: appearanceFromLook(look), speciesOrBreed: "" });
  }

  return (
    <View style={{ gap: 16 }}>
      <AvatarPreview pet={kind === "pet"} skin={skinTone} hair={hairColor} eyes={kind === "pet" ? "" : eyeColor} />
      {kind === "pet" ? (
        <>
          <SwatchRow
            label="What kind of pet"
            options={PET_SPECIES}
            value={eyeColor}
            onChange={(value) => {
              setEyeColor(value);
              emit({ eyeColor: value });
            }}
          />
          <SwatchRow
            label="Color"
            options={PET_COLORS}
            value={hairColor}
            onChange={(value) => {
              setHairColor(value);
              emit({ hairColor: value });
            }}
          />
          <SwatchRow
            label="Size"
            options={PET_SIZES}
            value={hairStyle}
            onChange={(value) => {
              setHairStyle(value);
              emit({ hairStyle: value });
            }}
          />
          <Field
            label="Breed, markings, or another animal"
            value={clothesExtra}
            onChangeText={(value) => {
              setClothesExtra(value);
              emit({ clothesExtra: value });
            }}
          />
        </>
      ) : (
        <>
          <SwatchRow
            label="Skin"
            options={SKIN_TONES}
            value={skinTone}
            onChange={(value) => {
              setSkinTone(value);
              emit({ skinTone: value });
            }}
          />
          <SwatchRow
            label="Hair"
            options={HAIR_STYLES}
            value={hairStyle}
            onChange={(value) => {
              setHairStyle(value);
              emit({ hairStyle: value });
            }}
          />
          <SwatchRow
            label="Hair color"
            options={HAIR_COLORS}
            value={hairColor}
            onChange={(value) => {
              setHairColor(value);
              emit({ hairColor: value });
            }}
          />
          <SwatchRow
            label="Eyes"
            options={EYE_COLORS}
            value={eyeColor}
            onChange={(value) => {
              setEyeColor(value);
              emit({ eyeColor: value });
            }}
          />
          <SwatchRow
            label="Usual clothes"
            options={CLOTHES}
            value={clothes}
            onChange={(value) => {
              setClothes(value);
              emit({ clothes: value });
            }}
          />
        </>
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {kind === "person" ? (
          <Pressable
            onPress={() => setShowExtras((open) => !open)}
            style={{
              minHeight: 44,
              paddingHorizontal: 16,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.white,
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.navy, fontWeight: "700" }}>
              {showExtras ? "Hide extra notes" : "Add extra notes"}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => {
            setHairStyle("");
            setHairColor("");
            setHairExtra("");
            setEyeColor("");
            setEyeExtra("");
            setSkinTone("");
            setSkinExtra("");
            setClothes("");
            setClothesExtra("");
            setShowExtras(false);
            onChange({
              hair: "",
              eyes: "",
              skin: "",
              usualClothes: "",
              appearance: "",
              speciesOrBreed: "",
            });
          }}
          style={{ minHeight: 44, paddingHorizontal: 16, justifyContent: "center" }}
        >
          <Text style={{ color: colors.navy, fontWeight: "700" }}>Clear look</Text>
        </Pressable>
      </View>
      {kind === "person" && showExtras ? (
        <View style={{ gap: 12 }}>
          <Field
            label="Hair notes"
            value={hairExtra}
            onChangeText={(value) => {
              setHairExtra(value);
              emit({ hairExtra: value });
            }}
          />
          <Field
            label="Eye notes"
            value={eyeExtra}
            onChangeText={(value) => {
              setEyeExtra(value);
              emit({ eyeExtra: value });
            }}
          />
          <Field
            label="Skin notes"
            value={skinExtra}
            onChangeText={(value) => {
              setSkinExtra(value);
              emit({ skinExtra: value });
            }}
          />
          <Field
            label="Clothes notes"
            value={clothesExtra}
            onChangeText={(value) => {
              setClothesExtra(value);
              emit({ clothesExtra: value });
            }}
          />
        </View>
      ) : null}
      {composed.appearance ? (
        <Text style={{ color: colors.muted, fontSize: 14 }}>{composed.appearance}</Text>
      ) : null}
    </View>
  );
}
