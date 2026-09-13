"use client";

import { useRef } from "react";
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
import { easing } from "@/lib/motion";
import { NAV_SWIPE_TABS } from "@/features/trips/hooks/use-trip-tab";
import { useIsDesktop } from "@/hooks/use-media-query";
import { JEJU_TRIP_ID } from "@/lib/jeju-trip";

export function TripDetailView({ tripId }: { tripId: string }) {
  const { data: trip, isLoading, isError } = useTrip(tripId);
  const { tab, setTab } = useTripTab();
  const slideDuration = useMotionSafeDuration("slide");
  const isDesktop = useIsDesktop();
  const panel = tab === "memo" ? "prep" : tab;
  const panelIndex = NAV_SWIPE_TABS.indexOf(panel);
  const prevIndexRef = useRef(panelIndex);
  const dirRef = useRef(1);
  if (panelIndex !== prevIndexRef.current) {
    dirRef.current = panelIndex > prevIndexRef.current ? 1 : -1;
    prevIndexRef.current = panelIndex;
  }
  const dir = dirRef.current;

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
        <AnimatePresence initial={false} mode="sync" custom={dir}>
          <motion.div
            key={panel}
            custom={dir}
            id={`trip-tabpanel-${panel}`}
            role="tabpanel"
            aria-labelledby={`trip-tab-${panel}`}
            variants={{
              enter: (direction: number) => ({ x: `${direction * 100}%` }),
              center: { x: 0 },
              exit: (direction: number) => ({ x: `${direction * -100}%` }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: slideDuration, ease: easing.standard }}
            className="absolute inset-0 overflow-x-clip overflow-y-auto [overflow-anchor:none]"
            drag={isDesktop || panel === "planner" ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={(_e, info) => {
              if (isDesktop) return;
              const idx = (NAV_SWIPE_TABS as readonly string[]).indexOf(panel);
              if (info.offset.x < -60 && idx < NAV_SWIPE_TABS.length - 1) {
                setTab(NAV_SWIPE_TABS[idx + 1]);
              }
              if (info.offset.x > 60 && idx > 0) {
                setTab(NAV_SWIPE_TABS[idx - 1]);
              }
            }}
          >
            <div className="min-h-full pt-[calc(44px+env(safe-area-inset-top,0px))]">
              {panel === "overview" && <OverviewTab tripId={tripId} />}
              {panel === "places" && <PlacesTab trip={trip} />}
              {panel === "planner" && <PlannerTab trip={trip} />}
              {panel === "budget" && <BudgetTab trip={trip} />}
              {panel === "prep" && (
                <PrepWorkspace tripId={tripId} initialSub={tab === "memo" ? "memo" : "prep"} />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomTripNav active={tab} onChange={setTab} />
    </div>
  );
}
