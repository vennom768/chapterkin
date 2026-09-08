"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CHILD_SEX_OPTIONS, isChildSex, type ChildSex } from "@/lib/child-sex";

export function ChildSexFields({
  name = "sex",
  value,
  required = true,
  onChange,
}: {
  name?: string;
  value?: string | null;
  required?: boolean;
  onChange?: (value: ChildSex) => void;
}) {
  const [selected, setSelected] = useState<ChildSex | "">(isChildSex(value) ? value : "");

  useEffect(() => {
    if (value === undefined) return;
    setSelected(isChildSex(value) ? value : "");
  }, [value]);

  function choose(next: ChildSex) {
    setSelected(next);
    onChange?.(next);
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-navy">Boy or girl</legend>
      <div className="flex flex-wrap gap-2">
        {CHILD_SEX_OPTIONS.map((option) => {
          const active = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => choose(option.value)}
              aria-pressed={active}
              className={cn(
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold",
                active
                  ? "border-[3px] border-gold bg-navy text-gold"
                  : "border border-border bg-white text-navy hover:bg-gold/15",
              )}
            >
              {active ? <span aria-hidden>✓</span> : null}
              {option.label}
            </button>
          );
        })}
      </div>
      <input
        className="sr-only"
        name={name}
        value={selected}
        required={required}
        readOnly
        tabIndex={-1}
        aria-hidden
      />
      <p className="mt-2 text-sm text-muted">
        {selected ? `Selected: ${selected === "girl" ? "Girl" : "Boy"}` : "Tap Girl or Boy."}
      </p>
    </fieldset>
  );
}
