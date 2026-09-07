import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full min-h-11 rounded-xl border border-border bg-white px-3.5 py-2.5 text-base text-foreground outline-none ring-accent/30 placeholder:text-muted/70 focus:ring-2",
        className,
      )}
      {...props}
    />
  );
});
