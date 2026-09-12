"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ExpandableCardBody({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: (expanded: boolean) => ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-label={expanded ? `${label} 접기` : `${label} 펼쳐보기`}
      onClick={() => setExpanded((open) => !open)}
      className={cn("min-w-0 flex-1 cursor-pointer text-left", className)}
    >
      {children(expanded)}
    </button>
  );
}
