"use client";

import { useTrip } from "@/features/trips/hooks";
import { useTripTab, type TripPanel } from "@/features/trips/hooks/use-trip-tab";
import { BottomTripNav } from "@/features/trips/components/bottom-trip-nav";
import { OverviewTab } from "@/features/overview/components/overview-tab";
import { PlacesTab } from "@/features/places/components/places-tab";
import { PlannerTab } from "@/features/planner/components/planner-tab";
import { BudgetTab } from "@/features/expenses/components/budget-tab";
import { PrepWorkspace } from "@/features/checklists/components/prep-workspace";
import { HomePageSkeleton, ListPageSkeleton, PlannerPageSkeleton, BudgetPageSkeleton, PrepPageSkeleton } from "@/components/ui/page-skeleton";
import { JEJU_TRIP_ID } from "@/lib/jeju-trip";

export function TripDetailView({ tripId }: { tripId: string }) {
  const { data: trip, isLoading, isError } = useTrip(tripId);
  const { tab, setTab } = useTripTab();
  const panel: TripPanel = tab === "memo" ? "prep" : tab;

  const skeleton =
    panel === "planner" ? (
      <PlannerPageSkeleton />
    ) : panel === "places" ? (
      <ListPageSkeleton />
    ) : panel === "budget" ? (
      <BudgetPageSkeleton />
    ) : panel === "prep" ? (
      <PrepPageSkeleton />
    ) : (
      <HomePageSkeleton />
    );

  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white">
        <div className="relative min-h-0 flex-1 overflow-hidden">{skeleton}</div>
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

  const hideChromeTitle = trip.id === JEJU_TRIP_ID && panel === "overview";

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      {hideChromeTitle ? null : (
        <h1 className="sr-only">
          {trip.coverEmoji} {trip.title}
        </h1>
      )}
      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        role="tabpanel"
        id={`trip-tabpanel-${panel}`}
        aria-labelledby={`trip-tab-${panel}`}
      >
        {panel === "overview" ? <OverviewTab tripId={tripId} /> : null}
        {panel === "places" ? <PlacesTab trip={trip} /> : null}
        {panel === "planner" ? <PlannerTab trip={trip} /> : null}
        {panel === "budget" ? <BudgetTab trip={trip} /> : null}
        {panel === "prep" ? (
          <PrepWorkspace tripId={tripId} initialSub={tab === "memo" ? "memo" : "prep"} />
        ) : null}
      </div>
      <BottomTripNav active={tab} onChange={setTab} />
    </div>
  );
}
