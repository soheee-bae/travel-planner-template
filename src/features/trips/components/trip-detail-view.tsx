"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTrip } from "@/features/trips/hooks";
import { useTripTab } from "@/features/trips/hooks/use-trip-tab";
import { BottomTripNav } from "@/features/trips/components/bottom-trip-nav";
import { OverviewTab } from "@/features/overview/components/overview-tab";
import { PlacesTab } from "@/features/places/components/places-tab";
import { PlannerTab } from "@/features/planner/components/planner-tab";
import { BudgetTab } from "@/features/expenses/components/budget-tab";
import { PrepWorkspace } from "@/features/checklists/components/prep-workspace";
import { useMotionSafeDuration } from "@/hooks/use-motion-safe";
import { NAV_SWIPE_TABS } from "@/features/trips/hooks/use-trip-tab";
import { useIsDesktop } from "@/hooks/use-media-query";
import { JEJU_TRIP_ID } from "@/lib/jeju-trip";

export function TripDetailView({ tripId }: { tripId: string }) {
  const { data: trip, isLoading, isError } = useTrip(tripId);
  const { tab, setTab } = useTripTab();
  const crossfade = useMotionSafeDuration("enter");
  const isDesktop = useIsDesktop();
  const panel = tab === "memo" ? "prep" : tab;

  if (isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">불러오는 중…</p>;
  }
  if (isError || !trip) {
    return <p className="p-6 text-sm text-destructive">여행을 찾을 수 없습니다.</p>;
  }

  return (
    <div className="flex flex-1 flex-col">
      {!(trip.id === JEJU_TRIP_ID && panel === "overview") ? (
        <header className="px-4 pt-4">
          <h1 className="font-heading text-lg font-bold">
            {trip.coverEmoji} {trip.title}
          </h1>
        </header>
      ) : null}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={panel}
            id={`trip-tabpanel-${panel}`}
            role="tabpanel"
            aria-labelledby={`trip-tab-${panel}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: crossfade }}
            drag={isDesktop ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={(_e, info) => {
              if (isDesktop) return;
              const idx = (NAV_SWIPE_TABS as readonly string[]).indexOf(panel);
              if (info.offset.x < -60 && idx < NAV_SWIPE_TABS.length - 1) {
                setTab(NAV_SWIPE_TABS[idx + 1]);
              }
              if (info.offset.x > 60 && idx > 0) setTab(NAV_SWIPE_TABS[idx - 1]);
            }}
          >
            {panel === "overview" && <OverviewTab tripId={tripId} />}
            {panel === "places" && <PlacesTab trip={trip} />}
            {panel === "planner" && <PlannerTab trip={trip} />}
            {panel === "budget" && <BudgetTab trip={trip} />}
            {panel === "prep" && <PrepWorkspace tripId={tripId} initialSub={tab === "memo" ? "memo" : "prep"} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomTripNav active={tab} onChange={setTab} />
    </div>
  );
}
