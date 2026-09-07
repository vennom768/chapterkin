import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card p-5 shadow-[0_10px_30px_-18px_rgba(44,24,16,0.35)] sm:p-6",
        className,
      )}
      {...props}
    />
  );
}
