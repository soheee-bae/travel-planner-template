"use client";

import { useState } from "react";
import { PrepTab } from "@/features/checklists/components/prep-tab";
import { MemoTab } from "@/features/wishlist/components/memo-tab";
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
    <div className="flex flex-col gap-3 p-4">
      <h2 className="font-heading text-xl font-bold">✅ 여행 준비</h2>
      <div className="grid grid-cols-2 border-b border-[#EEE]">
        <button
          type="button"
          onClick={() => setSub("prep")}
          className={cn(
            "py-2.5 text-sm",
            sub === "prep"
              ? "border-b-2 border-[#FF9F43] font-bold text-[#FF9F43]"
              : "font-medium text-[#8C8885]",
          )}
        >
          체크리스트
        </button>
        <button
          type="button"
          onClick={() => setSub("memo")}
          className={cn(
            "py-2.5 text-sm",
            sub === "memo"
              ? "border-b-2 border-[#FF9F43] font-bold text-[#FF9F43]"
              : "font-medium text-[#8C8885]",
          )}
        >
          메모
        </button>
      </div>
      {sub === "prep" ? <PrepTab tripId={tripId} embedded /> : <MemoTab tripId={tripId} embedded />}
    </div>
  );
}
