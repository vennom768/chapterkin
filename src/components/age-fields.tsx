"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function AgeFields({
  age,
  ageMonths,
  onAgeChange,
  onMonthsChange,
  yearsName = "age",
  monthsName = "ageMonths",
}: {
  age: number | string;
  ageMonths?: number | string | null;
  onAgeChange?: (years: string) => void;
  onMonthsChange?: (months: string) => void;
  yearsName?: string;
  monthsName?: string;
}) {
  const years = Number(age) || 0;
  const showMonths = years < 1;
  const controlled = Boolean(onAgeChange);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor={yearsName}>Age in years</Label>
        <Input
          id={yearsName}
          name={controlled ? undefined : yearsName}
          type="number"
          min={0}
          max={12}
          required
          {...(controlled
            ? { value: age, onChange: (event) => onAgeChange?.(event.target.value) }
            : { defaultValue: age })}
        />
        <p className="mt-1 text-xs text-muted">Newborns are 0 years.</p>
      </div>
      {showMonths ? (
        <div>
          <Label htmlFor={monthsName}>Age in months</Label>
          <Input
            id={monthsName}
            name={controlled ? undefined : monthsName}
            type="number"
            min={0}
            max={11}
            {...(controlled
              ? {
                  value: ageMonths ?? 0,
                  onChange: (event) => onMonthsChange?.(event.target.value),
                }
              : { defaultValue: ageMonths ?? 0 })}
          />
          <p className="mt-1 text-xs text-muted">0 months is a newborn.</p>
        </div>
      ) : controlled ? null : (
        <input type="hidden" name={monthsName} value="" />
      )}
    </div>
  );
}
