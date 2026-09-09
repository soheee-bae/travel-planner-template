"use client";

import { CalendarDays, CircleCheck, Home, MapPin, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TripTab } from "@/features/trips/hooks/use-trip-tab";
import type { LucideIcon } from "lucide-react";

const NAV_ITEMS: { tab: TripTab; label: string; icon: LucideIcon }[] = [
  { tab: "overview", label: "홈", icon: Home },
  { tab: "planner", label: "플래너", icon: CalendarDays },
  { tab: "places", label: "리스트", icon: MapPin },
  { tab: "budget", label: "비용", icon: Wallet },
  { tab: "prep", label: "준비", icon: CircleCheck },
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
      className="sticky bottom-0 z-30 border-t border-black/5 bg-white/92 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md"
    >
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const isActive = current === item.tab;
          const Icon = item.icon;
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
                "flex min-h-12 flex-col items-center justify-center gap-0.5 pt-2.5 pb-1 text-[9px]",
                isActive ? "font-bold text-[#FF9F43]" : "font-normal text-[#AAA]",
              )}
            >
              <Icon
                aria-hidden="true"
                className="size-6"
                strokeWidth={1.4}
                fill={isActive ? "#FFE0BC" : "#F5F5F5"}
              />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
