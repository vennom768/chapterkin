import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { ChoiceChip, Field } from "@/src/components/ui";
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

const CLOTHES_COLOR: Record<string, string> = {
  "cozy star pajamas": "#2a3a5c",
  "a yellow raincoat and red boots": "#e0b14a",
  "a striped shirt and jeans": "#c45c26",
  "a dinosaur T-shirt": "#3f7a3a",
  "a soft hoodie": "#6b3f22",
  "a sundress": "#e8b86d",
  overalls: "#2a3a5c",
  "a soccer jersey": "#c45c26",
};

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
        {options.map((option) => (
          <ChoiceChip
            key={option.value}
            label={option.label}
            color={option.color}
            selected={value === option.value}
            onPress={() => onChange(value === option.value ? "" : option.value)}
          />
        ))}
      </View>
    </View>
  );
}

function HairShape({
  style,
  color,
}: {
  style: string;
  color: string;
}) {
  if (!style && !color) return null;
  const fill = color || "#6b3f22";
  if (style === "a bun of") {
    return (
      <View style={{ alignItems: "center", marginBottom: -8 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: fill }} />
        <View style={{ width: 72, height: 22, borderRadius: 12, backgroundColor: fill, marginTop: -6 }} />
      </View>
    );
  }
  if (style === "a ponytail of") {
    return (
      <View style={{ alignItems: "center", marginBottom: -10 }}>
        <View style={{ width: 78, height: 28, borderRadius: 16, backgroundColor: fill }} />
        <View
          style={{
            position: "absolute",
            right: -18,
            top: 18,
            width: 22,
            height: 46,
            borderRadius: 12,
            backgroundColor: fill,
          }}
        />
      </View>
    );
  }
  if (style === "two puffs of") {
    return (
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 36, marginBottom: -8 }}>
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: fill }} />
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: fill }} />
      </View>
    );
  }
  if (style === "long" || style === "wavy" || style === "curly" || style === "coily" || style === "braided") {
    return (
      <View style={{ alignItems: "center", marginBottom: -18, zIndex: 1 }}>
        <View
          style={{
            width: style === "curly" || style === "coily" ? 108 : 96,
            height: style === "long" ? 78 : 64,
            borderRadius: 36,
            backgroundColor: fill,
          }}
        />
      </View>
    );
  }
  return (
    <View style={{ alignItems: "center", marginBottom: -10 }}>
      <View style={{ width: 86, height: 28, borderRadius: 16, backgroundColor: fill }} />
    </View>
  );
}

function AvatarPreview({
  skin,
  hairStyle,
  hairColor,
  eyes,
  clothes,
  pet,
  petSize,
  appearance,
}: {
  skin: string;
  hairStyle: string;
  hairColor: string;
  eyes: string;
  clothes: string;
  pet?: boolean;
  petSize?: string;
  appearance: string;
}) {
  const skinColor = SKIN_TONES.find((item) => item.value === skin)?.color ?? "#f3d5bd";
  const dye = HAIR_COLORS.find((item) => item.value === hairColor)?.color ?? "";
  const eyeColor = EYE_COLORS.find((item) => item.value === eyes)?.color ?? "#5c3317";
  const petColor = PET_COLORS.find((item) => item.value === hairColor)?.color ?? "#6b3f22";
  const shirt = CLOTHES_COLOR[clothes] ?? (clothes ? colors.accent : "#d7c4a8");
  const petScale = petSize === "tiny" ? 0.7 : petSize === "small" ? 0.85 : petSize === "big" ? 1.15 : petSize === "very big" ? 1.3 : 1;

  return (
    <View
      style={{
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: "#fbf6ee",
        gap: 10,
      }}
    >
      {pet ? (
        <View style={{ transform: [{ scale: petScale }], alignItems: "center" }}>
          <View style={{ width: 112, height: 78, borderRadius: 36, backgroundColor: petColor }}>
            <View style={{ position: "absolute", top: -12, left: 16, width: 28, height: 28, borderRadius: 14, backgroundColor: petColor }} />
            <View style={{ position: "absolute", top: -12, right: 16, width: 28, height: 28, borderRadius: 14, backgroundColor: petColor }} />
            <View style={{ position: "absolute", top: 30, left: 28, width: 10, height: 10, borderRadius: 5, backgroundColor: "#1d1520" }} />
            <View style={{ position: "absolute", top: 30, right: 28, width: 10, height: 10, borderRadius: 5, backgroundColor: "#1d1520" }} />
          </View>
        </View>
      ) : (
        <View style={{ alignItems: "center" }}>
          <HairShape style={hairStyle} color={dye} />
          <View
            style={{
              width: 112,
              height: 112,
              borderRadius: 56,
              backgroundColor: skinColor,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.06)",
              zIndex: 2,
            }}
          >
            <View style={{ flexDirection: "row", gap: 22, marginTop: 8 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: eyeColor }} />
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: eyeColor }} />
            </View>
            <View style={{ marginTop: 14, width: 22, height: 4, borderRadius: 2, backgroundColor: "rgba(42,58,92,0.25)" }} />
          </View>
          <View
            style={{
              marginTop: -8,
              width: clothes === "a sundress" ? 78 : 72,
              height: clothes === "a sundress" ? 44 : 36,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              backgroundColor: shirt,
            }}
          />
        </View>
      )}
      <Text style={{ color: colors.navy, fontWeight: "800" }}>{pet ? "Pet look" : "Avatar preview"}</Text>
      <Text style={{ color: colors.muted, textAlign: "center", fontSize: 14 }}>
        {appearance || "Tap skin, hair, eyes, and clothes. This picture updates as you go."}
      </Text>
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
      <AvatarPreview
        pet={kind === "pet"}
        skin={skinTone}
        hairStyle={hairStyle}
        hairColor={hairColor}
        eyes={kind === "pet" ? "" : eyeColor}
        clothes={clothes}
        petSize={hairStyle}
        appearance={composed.appearance}
      />
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
          <ChoiceChip
            label={showExtras ? "Hide extra notes" : "Add extra notes"}
            selected={showExtras}
            onPress={() => setShowExtras((open) => !open)}
          />
        ) : null}
        <ChoiceChip
          label="Clear look"
          selected={false}
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
        />
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
    </View>
  );
}
