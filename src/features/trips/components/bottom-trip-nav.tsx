"use client";

import { cn } from "@/lib/utils";
import type { TripTab } from "@/features/trips/hooks/use-trip-tab";

type NavTab = Exclude<TripTab, "memo">;

const NAV_ITEMS: { tab: NavTab; label: string }[] = [
  { tab: "overview", label: "홈" },
  { tab: "planner", label: "플래너" },
  { tab: "places", label: "스팟" },
  { tab: "budget", label: "영수증" },
  { tab: "prep", label: "할거리" },
];

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <path
        d="M4.5 10.2 12 4.5l7.5 5.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-3v6H6A1.5 1.5 0 0 1 4.5 19z"
        fill={active ? "#FFE0BC" : "#F5F5F5"}
        stroke={active ? "#FF9F43" : "#BBBBBB"}
        strokeWidth="1.5"
      />
      <rect x="10.5" y="16" width="3" height="5" rx="0.5" fill={active ? "#FF9F43" : "#BBBBBB"} opacity="0.6" />
      <rect x="11.25" y="8.5" width="1.5" height="3" rx="0.4" fill={active ? "#FF9F43" : "#BBBBBB"} opacity="0.7" />
    </svg>
  );
}

function PlannerIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <rect
        x="3"
        y="5"
        width="18"
        height="17"
        rx="2"
        fill={active ? "#FFE0BC" : "#F5F5F5"}
        stroke={active ? "#FF9F43" : "#BBBBBB"}
        strokeWidth="1.4"
      />
      <path d="M3 10h18" stroke={active ? "#FF9F43" : "#BBBBBB"} strokeWidth="1.2" />
      <path d="M8 3v4M16 3v4" stroke={active ? "#FF9F43" : "#BBBBBB"} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="6.5" y="13.5" width="3" height="3" rx="0.4" fill={active ? "#FF9F43" : "#BBBBBB"} />
      <rect x="10.5" y="13.5" width="3" height="3" rx="0.4" fill={active ? "#FF9F43" : "#BBBBBB"} />
      <rect x="14.5" y="13.5" width="3" height="3" rx="0.4" fill={active ? "#FF9F43" : "#BBBBBB"} opacity="0.4" />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <path
        d="M12 3.5c-3.2 0-6 2.5-6 6.3 0 4.4 6 10.7 6 10.7s6-6.3 6-10.7c0-3.8-2.8-6.3-6-6.3z"
        fill={active ? "#FFE0BC" : "#F5F5F5"}
        stroke={active ? "#FF9F43" : "#BBBBBB"}
        strokeWidth="1.4"
      />
      <circle cx="12" cy="9.5" r="2.1" fill={active ? "#FF9F43" : "#BBBBBB"} />
    </svg>
  );
}

function BudgetIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <rect
        x="2"
        y="6"
        width="20"
        height="14"
        rx="2"
        fill={active ? "#FFE0BC" : "#F5F5F5"}
        stroke={active ? "#FF9F43" : "#BBBBBB"}
        strokeWidth="1.4"
      />
      <path d="M2 10h20" stroke={active ? "#FF9F43" : "#BBBBBB"} strokeWidth="1.2" />
      <rect x="15" y="13" width="5" height="4" rx="0.6" fill={active ? "#FF9F43" : "#BBBBBB"} />
      <path d="M8 4h8" stroke={active ? "#FF9F43" : "#BBBBBB"} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function PrepIcon({ active }: { active: boolean }) {
  const fill = active ? "#FFE0BC" : "#F5F5F5";
  const stroke = active ? "#FF9F43" : "#BBBBBB";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <rect x="4" y="4" width="16" height="16" rx="3.5" fill={fill} stroke={stroke} strokeWidth="1.4" />
      <path
        d="M8 12.15 10.75 14.8 16.2 8.85"
        fill="none"
        stroke={stroke}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ICONS = {
  overview: HomeIcon,
  planner: PlannerIcon,
  places: ListIcon,
  budget: BudgetIcon,
  prep: PrepIcon,
} as const;

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
      className="sticky bottom-0 z-30 box-border flex h-[calc(3.5rem+env(safe-area-inset-bottom,0px))] shrink-0 items-center justify-center border-t border-black/5 bg-[rgba(255,255,255,0.92)] pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-[8px]"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = current === item.tab;
        const Icon = ICONS[item.tab];
        return (
          <button
            key={item.tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`trip-tabpanel-${item.tab}`}
            id={`trip-tab-${item.tab}`}
            onClick={() => onChange(item.tab)}
            aria-label={item.label}
            className={cn(
              "flex h-full w-[78px] flex-1 flex-col items-center justify-center px-0.5 py-1",
              "gap-[2.75px] text-center text-[9px] leading-[14px]",
              isActive ? "font-bold text-[#FF9F43]" : "font-normal text-[#AAAAAA]",
            )}
          >
            <Icon active={isActive} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
