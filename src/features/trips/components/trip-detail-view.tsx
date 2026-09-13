"use client";

import { useEffect, useState } from "react";
import { useTrip } from "@/features/trips/hooks";
import { NAV_SWIPE_TABS, useTripTab, type TripPanel } from "@/features/trips/hooks/use-trip-tab";
import { BottomTripNav } from "@/features/trips/components/bottom-trip-nav";
import { OverviewTab } from "@/features/overview/components/overview-tab";
import { PlacesTab } from "@/features/places/components/places-tab";
import { PlannerTab } from "@/features/planner/components/planner-tab";
import { BudgetTab } from "@/features/expenses/components/budget-tab";
import { PrepWorkspace } from "@/features/checklists/components/prep-workspace";
import { JEJU_TRIP_ID } from "@/lib/jeju-trip";
import { cn } from "@/lib/utils";

export function TripDetailView({ tripId }: { tripId: string }) {
  const { data: trip, isLoading, isError } = useTrip(tripId);
  const { tab, setTab } = useTripTab();
  const panel: TripPanel = tab === "memo" ? "prep" : tab;
  const [mounted, setMounted] = useState<Set<TripPanel>>(() => new Set([panel]));

  useEffect(() => {
    setMounted((prev) => {
      if (prev.has(panel)) return prev;
      const next = new Set(prev);
      next.add(panel);
      return next;
    });
  }, [panel]);

  if (isLoading) {
    return (
      <p className="p-6 pt-[env(safe-area-inset-top,0px)] text-sm text-muted-foreground">불러오는 중…</p>
    );
  }
  if (isError || !trip) {
    return (
      <p className="p-6 pt-[env(safe-area-inset-top,0px)] text-[12px] leading-[18px] font-semibold text-[#E85D4C]">
        여행을 다시 불러와 주세요.
      </p>
    );
  }

  const hideChromeTitle = trip.id === JEJU_TRIP_ID && panel === "overview";

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      {hideChromeTitle ? null : (
        <h1 className="sr-only">
          {trip.coverEmoji} {trip.title}
        </h1>
      )}
      <div className="relative min-h-0 flex-1 overflow-x-clip overflow-y-hidden">
        {NAV_SWIPE_TABS.map((id) => {
          if (!mounted.has(id)) return null;
          const active = panel === id;
          return (
            <div
              key={id}
              id={`trip-tabpanel-${id}`}
              role="tabpanel"
              aria-labelledby={`trip-tab-${id}`}
              aria-hidden={!active}
              className={cn(
                "absolute inset-0 overflow-x-clip overflow-y-auto [overflow-anchor:none]",
                active ? "z-10" : "invisible pointer-events-none z-0",
              )}
            >
              <div className="box-border min-h-full pt-[calc(20px+env(safe-area-inset-top,0px))]">
                {id === "overview" && <OverviewTab tripId={tripId} active={active} />}
                {id === "places" && <PlacesTab trip={trip} />}
                {id === "planner" && <PlannerTab trip={trip} />}
                {id === "budget" && <BudgetTab trip={trip} />}
                {id === "prep" && (
                  <PrepWorkspace tripId={tripId} initialSub={tab === "memo" ? "memo" : "prep"} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <BottomTripNav active={tab} onChange={setTab} />
    </div>
  );
}
