"use client";

import { cn } from "@/lib/utils";
import { TRIP_TABS, type TripTab } from "@/features/trips/hooks/use-trip-tab";

const TAB_LABELS: Record<TripTab, string> = {
  overview: "홈",
  planner: "플래너",
  places: "리스트",
  budget: "비용",
  prep: "준비",
  memo: "메모",
};

/**
 * 좁은 화면에서는 가로 스크롤, 넓은 화면에서는 탭이 나란히 늘어난다.
 */
export function TabNavigation({
  active,
  onChange,
}: {
  active: TripTab;
  onChange: (tab: TripTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="여행 상세 탭"
      className="flex overflow-x-auto border-b border-border"
    >
      {TRIP_TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`trip-tabpanel-${tab}`}
            id={`trip-tab-${tab}`}
            onClick={() => onChange(tab)}
            className={cn(
              "min-h-11 flex-1 shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground",
            )}
          >
            {TAB_LABELS[tab]}
          </button>
        );
      })}
    </div>
  );
}
