"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTrip } from "@/features/trips/hooks";
import { useTripTab, type TripPanel } from "@/features/trips/hooks/use-trip-tab";
import { BottomTripNav } from "@/features/trips/components/bottom-trip-nav";
import { OverviewTab } from "@/features/overview/components/overview-tab";
import { PlacesTab } from "@/features/places/components/places-tab";
import { PlannerTab } from "@/features/planner/components/planner-tab";
import { BudgetTab } from "@/features/expenses/components/budget-tab";
import { PrepWorkspace } from "@/features/checklists/components/prep-workspace";
import { HomePageSkeleton } from "@/components/ui/page-skeleton";

function TabPane({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div
      className={cn("h-full min-h-0 w-full min-w-0", active ? "block" : "hidden")}
      inert={active ? undefined : true}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}

export function TripDetailView({ tripId }: { tripId: string }) {
  const { data: trip, isLoading, isError } = useTrip(tripId);
  const { tab, setTab } = useTripTab();
  const panel: TripPanel = tab === "memo" ? "prep" : tab;
  const visitedRef = useRef<Set<TripPanel>>(new Set(["overview"]));
  visitedRef.current.add(panel);
  const seen = visitedRef.current;

  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white">
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <HomePageSkeleton />
        </div>
        <BottomTripNav active={tab} onChange={setTab} />
      </div>
    );
  }
  if (isError || !trip) {
    return (
      <p className="p-6 pt-[env(safe-area-inset-top,0px)] text-[12px] leading-[18px] font-semibold text-[#E85D4C]">
        여행을 다시 불러와 주세요.
      </p>
    );
  }

  const hideChromeTitle = panel === "overview";

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      {hideChromeTitle ? null : (
        <h1 className="sr-only">
          {trip.coverEmoji} {trip.title}
        </h1>
      )}
      <div
        className="relative min-h-0 min-w-0 flex-1 overflow-hidden"
        role="tabpanel"
        id={`trip-tabpanel-${panel}`}
        aria-labelledby={`trip-tab-${panel}`}
      >
        {seen.has("overview") ? (
          <TabPane active={panel === "overview"}>
            <OverviewTab tripId={tripId} />
          </TabPane>
        ) : null}
        {seen.has("places") ? (
          <TabPane active={panel === "places"}>
            <PlacesTab trip={trip} />
          </TabPane>
        ) : null}
        {seen.has("planner") ? (
          <TabPane active={panel === "planner"}>
            <PlannerTab trip={trip} active={panel === "planner"} />
          </TabPane>
        ) : null}
        {seen.has("budget") ? (
          <TabPane active={panel === "budget"}>
            <BudgetTab trip={trip} />
          </TabPane>
        ) : null}
        {seen.has("prep") ? (
          <TabPane active={panel === "prep"}>
            <PrepWorkspace tripId={tripId} initialSub={tab === "memo" ? "memo" : "prep"} />
          </TabPane>
        ) : null}
      </div>
      <BottomTripNav active={tab} onChange={setTab} />
    </div>
  );
}
