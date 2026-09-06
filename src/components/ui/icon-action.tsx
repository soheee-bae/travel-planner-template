"use client";

import { forwardRef } from "react";
import { PencilLine, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const IconAction = forwardRef<
  HTMLButtonElement,
  {
    action: "edit" | "delete";
    label: string;
    onClick?: () => void;
  }
>(function IconAction({ action, label, onClick }, ref) {
  const Icon = action === "edit" ? PencilLine : Trash2;
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors",
        action === "delete" ? "hover:bg-destructive/10 hover:text-destructive" : "hover:bg-muted",
      )}
    >
      <Icon className="size-3.5" strokeWidth={1.75} />
    </button>
  );
});
