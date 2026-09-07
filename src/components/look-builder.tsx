"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  CLOTHES,
  composeClothes,
  composeEyes,
  composeHair,
  composeSkin,
  EYE_COLORS,
  HAIR_COLORS,
  HAIR_STYLES,
  leftoverCustom,
  matchLookOption,
  SKIN_TONES,
  type LookOption,
} from "@/lib/looks";
import { cn } from "@/lib/utils";

function ChipRow({
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
                "inline-flex min-h-11 items-center rounded-full border px-3.5 text-sm font-semibold transition-colors",
                selected
                  ? "border-accent bg-gold/30 text-navy"
                  : "border-border bg-white text-navy hover:bg-gold/15",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LookBuilder({
  hair,
  eyes,
  skin,
  usualClothes,
}: {
  hair?: string | null;
  eyes?: string | null;
  skin?: string | null;
  usualClothes?: string | null;
}) {
  const [hairStyle, setHairStyle] = useState(() => matchLookOption(hair, HAIR_STYLES));
  const [hairColor, setHairColor] = useState(() => matchLookOption(hair, HAIR_COLORS));
  const [hairExtra, setHairExtra] = useState(() =>
    leftoverCustom(hair, [matchLookOption(hair, HAIR_STYLES), matchLookOption(hair, HAIR_COLORS), "hair"]),
  );
  const [eyeColor, setEyeColor] = useState(() => matchLookOption(eyes, EYE_COLORS));
  const [eyeExtra, setEyeExtra] = useState(() =>
    leftoverCustom(eyes, [matchLookOption(eyes, EYE_COLORS), "eyes"]),
  );
  const [skinTone, setSkinTone] = useState(() => matchLookOption(skin, SKIN_TONES));
  const [skinExtra, setSkinExtra] = useState(() =>
    leftoverCustom(skin, [matchLookOption(skin, SKIN_TONES), "skin"]),
  );
  const [clothes, setClothes] = useState(() => matchLookOption(usualClothes, CLOTHES));
  const [clothesExtra, setClothesExtra] = useState(() =>
    leftoverCustom(usualClothes, [matchLookOption(usualClothes, CLOTHES)]),
  );

  const composed = useMemo(
    () => ({
      hair: composeHair(hairStyle, hairColor, hairExtra),
      eyes: composeEyes(eyeColor, eyeExtra),
      skin: composeSkin(skinTone, skinExtra),
      usualClothes: composeClothes(clothes, clothesExtra),
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

  const preview = [composed.hair, composed.eyes, composed.skin, composed.usualClothes]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <input type="hidden" name="hair" value={composed.hair} />
      <input type="hidden" name="eyes" value={composed.eyes} />
      <input type="hidden" name="skin" value={composed.skin} />
      <input type="hidden" name="usualClothes" value={composed.usualClothes} />

      <ChipRow label="Hair" options={HAIR_STYLES} value={hairStyle} onChange={setHairStyle} />
      <ChipRow label="Hair color" options={HAIR_COLORS} value={hairColor} onChange={setHairColor} />
      <div>
        <Label htmlFor="hairExtra">Hair notes</Label>
        <input
          id="hairExtra"
          value={hairExtra}
          onChange={(event) => setHairExtra(event.target.value)}
          placeholder="Optional — a clip, a streak, always messy..."
          className="min-h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base"
        />
      </div>

      <ChipRow label="Eyes" options={EYE_COLORS} value={eyeColor} onChange={setEyeColor} />
      <div>
        <Label htmlFor="eyeExtra">Eye notes</Label>
        <input
          id="eyeExtra"
          value={eyeExtra}
          onChange={(event) => setEyeExtra(event.target.value)}
          placeholder="Optional — glasses, long lashes..."
          className="min-h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base"
        />
      </div>

      <ChipRow label="Skin" options={SKIN_TONES} value={skinTone} onChange={setSkinTone} />
      <div>
        <Label htmlFor="skinExtra">Skin notes</Label>
        <input
          id="skinExtra"
          value={skinExtra}
          onChange={(event) => setSkinExtra(event.target.value)}
          placeholder="Optional — freckles, rosy cheeks..."
          className="min-h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base"
        />
      </div>

      <ChipRow label="Usual clothes" options={CLOTHES} value={clothes} onChange={setClothes} />
      <div>
        <Label htmlFor="clothesExtra">Clothes notes</Label>
        <input
          id="clothesExtra"
          value={clothesExtra}
          onChange={(event) => setClothesExtra(event.target.value)}
          placeholder="Optional — favorite hat, always muddy knees..."
          className="min-h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base"
        />
      </div>

      <div className="rounded-2xl border border-border bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Picture notes
        </p>
        <p className="mt-1 font-serif text-lg leading-7 text-navy">
          {preview || "Tap a few pieces and we will keep this child looking the same in every book."}
        </p>
      </div>
    </div>
  );
}
