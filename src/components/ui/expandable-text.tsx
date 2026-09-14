"use client";

import { useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

export function ExpandableText({
  text,
  className,
  lines = 2,
}: {
  text: string;
  className?: string;
  lines?: 2 | 3;
}) {
  const [open, setOpen] = useState(false);

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setOpen((current) => !current);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={open}
      className={cn("w-full min-w-0 text-left", className)}
    >
      <span className={open ? "whitespace-pre-wrap break-words" : lines === 3 ? "line-clamp-3" : "line-clamp-2"}>
        {text}
      </span>
    </button>
  );
}
