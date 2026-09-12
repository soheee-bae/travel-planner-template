"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function MoneyInput({
  id,
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: {
  id?: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  className?: string;
  "aria-label"?: string;
}) {
  const display =
    value == null || Number.isNaN(value) ? "" : Math.max(0, Math.round(value)).toLocaleString("ko-KR");

  return (
    <div className="relative">
      <Input
        id={id}
        inputMode="numeric"
        aria-label={ariaLabel}
        value={display}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d]/g, "");
          if (digits === "") {
            onChange(undefined);
            return;
          }
          onChange(Number(digits));
        }}
        className={cn("pr-8", className)}
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
        원
      </span>
    </div>
  );
}
