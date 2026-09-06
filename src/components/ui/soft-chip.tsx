"use client";

import { cn } from "@/lib/utils";

export function SoftChip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-sm font-bold",
        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function DashedAddButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-12 w-full rounded-3xl border-2 border-dashed border-primary/70 bg-primary/5 text-sm font-bold text-primary"
    >
      {children}
    </button>
  );
}

export function EndMascot() {
  return (
    <div className="flex flex-col items-center gap-1 py-4">
      <p className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">...다 봤어? 👀</p>
      <span className="text-2xl" aria-hidden>
        ☃️
      </span>
    </div>
  );
}
