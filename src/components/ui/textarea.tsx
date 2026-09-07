import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base text-foreground outline-none ring-accent/30 placeholder:text-muted/70 focus:ring-2",
        className,
      )}
      {...props}
    />
  );
});
