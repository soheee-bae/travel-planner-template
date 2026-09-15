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
    className?: string;
  }
>(function IconAction({ action, label, onClick, className }, ref) {
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
        "flex size-8 items-center justify-center rounded-full text-[#B0AAA6] transition-colors hover:bg-muted",
        className,
      )}
    >
      <Icon className="size-4" strokeWidth={1.75} />
    </button>
  );
});
