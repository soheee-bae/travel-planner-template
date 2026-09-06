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
      <div className="grid grid-cols-2 rounded-2xl bg-muted p-1">
        <button
          type="button"
          onClick={() => setSub("prep")}
          className={cn(
            "rounded-xl py-2 text-sm font-bold",
            sub === "prep" ? "bg-card shadow-sm" : "text-muted-foreground",
          )}
        >
          ✅ 체크리스트
        </button>
        <button
          type="button"
          onClick={() => setSub("memo")}
          className={cn(
            "rounded-xl py-2 text-sm font-bold",
            sub === "memo" ? "bg-card shadow-sm" : "text-muted-foreground",
          )}
        >
          📝 메모
        </button>
      </div>
      {sub === "prep" ? <PrepTab tripId={tripId} embedded /> : <MemoTab tripId={tripId} embedded />}
    </div>
  );
}
