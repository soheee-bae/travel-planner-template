"use client";

import { FigmaChip, FigmaCtaButton } from "@/components/ui/figma";

export function SoftChip({
  active,
  onClick,
  children,
  tone = "orange",
  size = "md",
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  tone?: "orange" | "dark";
  size?: "sm" | "md";
}) {
  return (
    <FigmaChip active={active} tone={tone} size={size} onClick={onClick}>
      {children}
    </FigmaChip>
  );
}

export function DashedAddButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return <FigmaCtaButton onClick={onClick}>{children}</FigmaCtaButton>;
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
