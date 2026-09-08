"use client";

import { useId, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
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
} from "@/lib/looks";
import { cn } from "@/lib/utils";

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
    <div>
      <p className="mb-2 text-sm font-semibold text-navy">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(selected ? "" : option.value)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm font-semibold transition-colors",
                selected
                  ? "border-accent bg-gold/30 text-navy"
                  : "border-border bg-white text-navy hover:bg-gold/15",
              )}
            >
              {option.color ? (
                <span
                  className="h-5 w-5 rounded-full border border-black/10"
                  style={{ backgroundColor: option.color }}
                  aria-hidden
                />
              ) : null}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AvatarPreview({
  skin,
  hair,
  hairStyle,
  eyes,
  clothes,
  sex,
  pet,
}: {
  skin: string;
  hair: string;
  hairStyle?: string;
  eyes: string;
  clothes: string;
  sex?: string | null;
  pet?: boolean;
}) {
  const skinColor = SKIN_TONES.find((item) => item.value === skin)?.color ?? "#f0c7a0";
  const hairColor = HAIR_COLORS.find((item) => item.value === hair)?.color ?? "#6b3f22";
  const eyeColor = EYE_COLORS.find((item) => item.value === eyes)?.color ?? "#5c3317";
  const petColor = PET_COLORS.find((item) => item.value === hair)?.color ?? "#6b3f22";
  const style = hairStyle || (sex === "girl" ? "long" : sex === "boy" ? "short" : "");
  const sexLabel = sex === "girl" ? "Girl" : sex === "boy" ? "Boy" : null;

  if (pet) {
    return (
      <div className="grid place-items-center rounded-[1.75rem] border border-border bg-[#fbf6ee] px-4 py-6">
        <div
          className="relative h-28 w-36 rounded-[2.5rem]"
          style={{ backgroundColor: petColor }}
        >
          <span className="absolute -top-3 left-5 h-8 w-8 rounded-full" style={{ backgroundColor: petColor }} />
          <span className="absolute -top-3 right-5 h-8 w-8 rounded-full" style={{ backgroundColor: petColor }} />
          <span className="absolute left-10 top-12 h-3 w-3 rounded-full bg-navy/80" />
          <span className="absolute right-10 top-12 h-3 w-3 rounded-full bg-navy/80" />
        </div>
        <p className="mt-3 text-sm font-semibold text-navy">Pet look</p>
      </div>
    );
  }

  return (
    <div className="grid place-items-center rounded-[1.75rem] border border-border bg-[#fbf6ee] px-4 py-6">
      <div className="relative">
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 rounded-full",
            style === "long" || style === "wavy" || style === "curly" || style === "coily" || style === "braided"
              ? "top-[-18px] h-16 w-28"
              : "top-[-10px] h-10 w-24",
          )}
          style={{ backgroundColor: hair || style ? hairColor : "transparent" }}
        />
        <div
          className="relative grid h-28 w-28 place-items-center rounded-full border border-black/5"
          style={{ backgroundColor: skinColor }}
        >
          <div className="mt-2 flex gap-6">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: eyeColor }} />
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: eyeColor }} />
          </div>
          <span className="mt-4 h-1.5 w-6 rounded-full bg-navy/20" />
        </div>
        <div className="mx-auto mt-[-6px] h-10 w-20 rounded-b-2xl bg-accent/80" title={clothes} />
      </div>
      <p className="mt-3 text-sm font-semibold text-navy">
        {sexLabel ? `${sexLabel} · Avatar preview` : "Avatar preview"}
      </p>
    </div>
  );
}

export function LookBuilder({
  hair,
  eyes,
  skin,
  usualClothes,
  sex,
  kind = "person",
  names,
  onChange,
}: {
  hair?: string | null;
  eyes?: string | null;
  skin?: string | null;
  usualClothes?: string | null;
  sex?: string | null;
  kind?: "person" | "pet";
  names?: PersonLook;
  onChange?: (look: PersonLook & { appearance: string; speciesOrBreed: string }) => void;
}) {
  const fieldId = useId();
  const [hairStyle, setHairStyle] = useState(() =>
    kind === "pet" ? matchLookOption(usualClothes ?? hair, PET_SIZES) : matchLookOption(hair, HAIR_STYLES),
  );
  const [hairColor, setHairColor] = useState(() =>
    kind === "pet"
      ? matchLookOption(usualClothes ?? hair ?? eyes, PET_COLORS)
      : matchLookOption(hair, HAIR_COLORS),
  );
  const [hairExtra, setHairExtra] = useState(() =>
    leftoverCustom(hair, [
      matchLookOption(hair, HAIR_STYLES),
      matchLookOption(hair, HAIR_COLORS),
      "hair",
    ]),
  );
  const [eyeColor, setEyeColor] = useState(() =>
    kind === "pet" ? matchLookOption(usualClothes ?? speciesFrom(hair, usualClothes), PET_SPECIES) : matchLookOption(eyes, EYE_COLORS),
  );
  const [eyeExtra, setEyeExtra] = useState(() =>
    leftoverCustom(eyes, [matchLookOption(eyes, EYE_COLORS), "eyes"]),
  );
  const [skinTone, setSkinTone] = useState(() => matchLookOption(skin, SKIN_TONES));
  const [skinExtra, setSkinExtra] = useState(() =>
    leftoverCustom(skin, [matchLookOption(skin, SKIN_TONES), "skin"]),
  );
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

  const personLook = useMemo(
    () =>
      composePersonLook({
        hairStyle,
        hairColor,
        hairExtra,
        eyeColor,
        eyeExtra,
        skinTone,
        skinExtra,
        clothes,
        clothesExtra,
      }),
    [
      clothes,
      clothesExtra,
      eyeColor,
      eyeExtra,
      hairColor,
      hairExtra,
      hairStyle,
      skinExtra,
      skinTone,
    ],
  );

  const petAppearance = composePetLook(eyeColor, hairColor, hairStyle, clothesExtra);
  const composed = kind === "pet"
    ? {
        hair: "",
        eyes: "",
        skin: "",
        usualClothes: petAppearance,
        appearance: petAppearance,
        speciesOrBreed: eyeColor || clothesExtra.trim(),
      }
    : {
        ...personLook,
        appearance: appearanceFromLook(personLook),
        speciesOrBreed: "",
      };

  const fieldNames = names ?? {
    hair: "hair",
    eyes: "eyes",
    skin: "skin",
    usualClothes: "usualClothes",
  };

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
    const look =
      kind === "pet"
        ? {
            hair: "",
            eyes: "",
            skin: "",
            usualClothes: composePetLook(
              next.eyeColor ?? eyeColor,
              next.hairColor ?? hairColor,
              next.hairStyle ?? hairStyle,
              next.clothesExtra ?? clothesExtra,
            ),
          }
        : composePersonLook(merged);
    onChange?.({
      ...look,
      appearance:
        kind === "pet"
          ? look.usualClothes
          : appearanceFromLook(look),
      speciesOrBreed:
        kind === "pet"
          ? (next.eyeColor ?? eyeColor) || (next.clothesExtra ?? clothesExtra).trim()
          : "",
    });
  }

  function clearAll() {
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
    onChange?.({
      hair: "",
      eyes: "",
      skin: "",
      usualClothes: "",
      appearance: "",
      speciesOrBreed: "",
    });
  }

  return (
    <div className="space-y-6">
      {!onChange ? (
        <>
          <input type="hidden" name={fieldNames.hair} value={composed.hair} />
          <input type="hidden" name={fieldNames.eyes} value={composed.eyes} />
          <input type="hidden" name={fieldNames.skin} value={composed.skin} />
          <input type="hidden" name={fieldNames.usualClothes} value={composed.usualClothes} />
        </>
      ) : null}

      <AvatarPreview
        pet={kind === "pet"}
        skin={skinTone}
        hair={hairColor}
        hairStyle={kind === "pet" ? "" : hairStyle}
        eyes={kind === "pet" ? "" : eyeColor}
        clothes={clothes}
        sex={kind === "pet" ? undefined : sex}
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
          <div>
            <Label htmlFor={`${fieldId}-petExtra`}>Breed, markings, or another animal</Label>
            <input
              id={`${fieldId}-petExtra`}
              value={clothesExtra}
              onChange={(event) => {
                setClothesExtra(event.target.value);
                emit({ clothesExtra: event.target.value });
              }}
              placeholder="Shetland pony, a goat named Clover, floppy ears..."
              className="min-h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base"
            />
            <p className="mt-1 text-xs text-muted">
              Horse, pony, barn animals, reptiles, and any other pet are welcome.
              Type it here if it is not in the list.
            </p>
          </div>
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

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {kind === "person" ? (
          <button
            type="button"
            onClick={() => setShowExtras((open) => !open)}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-gold/20 sm:w-auto"
          >
            {showExtras ? "Hide extra notes" : "Add extra notes"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-navy hover:bg-gold/15 sm:w-auto"
        >
          Clear look
        </button>
      </div>

      {kind === "person" && showExtras ? (
        <div className="space-y-3 rounded-2xl border border-border bg-white p-4">
          <p className="text-sm text-muted">
            Extra notes are optional. Delete anything you do not want in the
            pictures.
          </p>
              <div>
                <Label htmlFor="hairExtra">Hair notes</Label>
                <input
                  id="hairExtra"
                  value={hairExtra}
                  onChange={(event) => {
                    setHairExtra(event.target.value);
                    emit({ hairExtra: event.target.value });
                  }}
                  placeholder="A clip, a streak, always messy..."
                  className="min-h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base"
                />
              </div>
              <div>
                <Label htmlFor="eyeExtra">Eye notes</Label>
                <input
                  id="eyeExtra"
                  value={eyeExtra}
                  onChange={(event) => {
                    setEyeExtra(event.target.value);
                    emit({ eyeExtra: event.target.value });
                  }}
                  placeholder="Glasses, long lashes..."
                  className="min-h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base"
                />
              </div>
              <div>
                <Label htmlFor="skinExtra">Skin notes</Label>
                <input
                  id="skinExtra"
                  value={skinExtra}
                  onChange={(event) => {
                    setSkinExtra(event.target.value);
                    emit({ skinExtra: event.target.value });
                  }}
                  placeholder="Freckles, rosy cheeks..."
                  className="min-h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base"
                />
              </div>
              <div>
                <Label htmlFor="clothesExtra">Clothes notes</Label>
                <input
                  id="clothesExtra"
                  value={clothesExtra}
                  onChange={(event) => {
                    setClothesExtra(event.target.value);
                    emit({ clothesExtra: event.target.value });
                  }}
                  placeholder="Favorite hat, always muddy knees..."
                  className="min-h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base"
                />
              </div>
        </div>
      ) : null}
    </div>
  );
}

function speciesFrom(hair?: string | null, usualClothes?: string | null) {
  return usualClothes || hair || "";
}
