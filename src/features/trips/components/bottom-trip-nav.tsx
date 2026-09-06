"use client";

import { cn } from "@/lib/utils";
import type { TripTab } from "@/features/trips/hooks/use-trip-tab";

const NAV_ITEMS: { tab: TripTab; label: string; emoji: string }[] = [
  { tab: "overview", label: "홈", emoji: "🏠" },
  { tab: "planner", label: "플래너", emoji: "📅" },
  { tab: "places", label: "리스트", emoji: "📍" },
  { tab: "budget", label: "비용", emoji: "👛" },
  { tab: "prep", label: "준비", emoji: "✅" },
];

export function BottomTripNav({
  active,
  onChange,
}: {
  active: TripTab;
  onChange: (tab: TripTab) => void;
}) {
  const current = active === "memo" ? "prep" : active;

  return (
    <nav
      role="tablist"
      aria-label="여행 상세 탭"
      className="sticky bottom-0 z-30 border-t border-border bg-card px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1"
    >
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const isActive = current === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`trip-tabpanel-${item.tab}`}
              id={`trip-tab-${item.tab}`}
              onClick={() => onChange(item.tab)}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-semibold",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span aria-hidden="true" className="text-base">
                {item.emoji}
              </span>
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
