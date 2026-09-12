"use client";

import { useState } from "react";
import { PrepTab } from "@/features/checklists/components/prep-tab";
import { MemoTab } from "@/features/wishlist/components/memo-tab";
import { FigmaPage, FigmaPageHeader, FigmaPageTitle } from "@/components/ui/figma";
import { cn } from "@/lib/utils";

export function PrepWorkspace({
  tripId,
  initialSub,
}: {
  tripId: string;
  initialSub: "prep" | "memo";
}) {
  const [sub, setSub] = useState<"prep" | "memo">(initialSub);

  return (
    <div className="flex min-h-full flex-col bg-white">
      <FigmaPageHeader>
        <FigmaPageTitle>제주에서 슬쩍 하고 싶은 것들</FigmaPageTitle>
      </FigmaPageHeader>
      <FigmaPage>
        <div
          className="flex h-10 w-full items-start justify-center rounded-[14px] bg-[#FFF8EE] p-1"
          role="tablist"
          aria-label="준비 하위 탭"
        >
          <button
            type="button"
            role="tab"
            aria-selected={sub === "prep"}
            onClick={() => setSub("prep")}
            className={cn(
              "flex h-8 w-[170px] flex-col items-center justify-center rounded-[10px] px-0 py-2.5 text-[14px] leading-[21px]",
              sub === "prep"
                ? "bg-white font-bold text-[#4A4543] shadow-[0px_2px_12px_rgba(0,0,0,0.06)]"
                : "font-bold text-[#8C8885]",
            )}
          >
            소소한 할거리
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={sub === "memo"}
            onClick={() => setSub("memo")}
            className={cn(
              "flex h-8 w-[169px] flex-col items-center justify-center rounded-[10px] px-0 py-2.5 text-[14px] leading-[21px]",
              sub === "memo"
                ? "bg-white font-medium text-[#4A4543] shadow-[0px_2px_12px_rgba(0,0,0,0.06)]"
                : "font-medium text-[#8C8885]",
            )}
          >
            끄적끄적
          </button>
        </div>
        {sub === "prep" ? <PrepTab tripId={tripId} embedded /> : <MemoTab tripId={tripId} embedded />}
      </FigmaPage>
    </div>
  );
}
