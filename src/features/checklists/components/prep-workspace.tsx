"use client";

import { useRef, useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import { PrepTab } from "@/features/checklists/components/prep-tab";
import { MemoTab } from "@/features/wishlist/components/memo-tab";
import { FigmaPage, FigmaPageHeader, FigmaPageTitle } from "@/components/ui/figma";
import { SegmentedSwap } from "@/components/ui/segmented-swap";
import { useReducedMotion } from "@/hooks/use-motion-safe";
import { cn } from "@/lib/utils";

const SUBS = [
  { id: "prep", label: "소소한 할거리" },
  { id: "memo", label: "끄적끄적" },
] as const;

export function PrepWorkspace({
  tripId,
  initialSub,
}: {
  tripId: string;
  initialSub: "prep" | "memo";
}) {
  const [sub, setSub] = useState<"prep" | "memo">(initialSub);
  const prevRef = useRef(sub);
  const dirRef = useRef(1);
  if (sub !== prevRef.current) {
    dirRef.current = sub === "memo" ? 1 : -1;
    prevRef.current = sub;
  }
  const reduce = useReducedMotion();

  return (
    <div className="flex min-h-full flex-col bg-white">
      <FigmaPageHeader>
        <FigmaPageTitle>제주에서 슬쩍 하고 싶은 것들</FigmaPageTitle>
      </FigmaPageHeader>
      <FigmaPage>
        <LayoutGroup id="prep-sub-tabs">
        <div
          className="flex h-10 w-full items-start justify-center rounded-[14px] bg-[#FFF8EE] p-1"
          role="tablist"
          aria-label="준비 하위 탭"
        >
          {SUBS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={sub === item.id}
              onClick={() => setSub(item.id)}
              className={cn(
                "relative flex h-8 min-w-0 flex-1 flex-col items-center justify-center rounded-[10px] px-0 py-2.5 text-[14px] leading-[21px]",
                sub === item.id ? "font-bold text-[#4A4543]" : "font-medium text-[#8C8885]",
              )}
            >
              {sub === item.id ? (
                <motion.span
                  layoutId="prep-sub-pill"
                  className="absolute inset-0 rounded-[10px] bg-white shadow-[0px_2px_12px_rgba(0,0,0,0.06)]"
                  transition={
                    reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }
                  }
                  aria-hidden
                />
              ) : null}
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </div>
        </LayoutGroup>
        <SegmentedSwap activeKey={sub} direction={dirRef.current}>
          {sub === "prep" ? <PrepTab tripId={tripId} embedded /> : <MemoTab tripId={tripId} embedded />}
        </SegmentedSwap>
      </FigmaPage>
    </div>
  );
}
