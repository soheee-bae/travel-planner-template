"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { sheetSpring } from "@/lib/motion";
import { useIsDesktop } from "@/hooks/use-media-query";

const HEIGHT_PEEK = 220;
const HEIGHT_FULL = 480;
const DRAG_CLOSE_THRESHOLD = 60;

/**
 * 모바일: 지도 아래 피크/풀 시트. 데스크톱: 높이 고정 없이 옆 컬럼 리스트.
 */
export function DaySheet({ children }: { children: ReactNode }) {
  const isDesktop = useIsDesktop();
  const [expanded, setExpanded] = useState(false);

  if (isDesktop) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">{children}</div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col overflow-hidden rounded-t-xl border border-border bg-card"
      animate={{ height: expanded ? HEIGHT_FULL : HEIGHT_PEEK }}
      transition={sheetSpring}
    >
      <motion.div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={expanded ? "일정 시트 접기" : "일정 시트 펼치기"}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setExpanded((v) => !v);
        }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.4}
        onDragEnd={(_, info) => {
          if (info.offset.y > DRAG_CLOSE_THRESHOLD) setExpanded(false);
          else if (info.offset.y < -DRAG_CLOSE_THRESHOLD) setExpanded(true);
        }}
        className="flex shrink-0 cursor-pointer touch-none flex-col items-center gap-1 py-2"
      >
        <span className="h-1 w-9 rounded-full bg-border" />
      </motion.div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3">{children}</div>
    </motion.div>
  );
}
