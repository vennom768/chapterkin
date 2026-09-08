"use client";

import { cn } from "@/lib/utils";
import { CHILD_SEX_OPTIONS, type ChildSex } from "@/lib/child-sex";

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
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-navy">Boy or girl</legend>
      <div className="flex flex-wrap gap-2">
        {CHILD_SEX_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-5 text-sm font-semibold",
                selected
                  ? "border-accent bg-gold/30 text-navy"
                  : "border-border bg-white text-navy hover:bg-gold/15",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={onChange ? selected : undefined}
                defaultChecked={!onChange ? selected : undefined}
                required={required}
                onChange={() => onChange?.(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
