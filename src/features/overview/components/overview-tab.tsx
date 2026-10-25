"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useAccommodations, useTransports } from "@/features/overview/hooks";
import { AddAccommodationDialog } from "@/features/overview/components/add-accommodation-dialog";
import { AddTransportDialog } from "@/features/overview/components/add-transport-dialog";
import { JejuHomeHero } from "@/features/overview/components/jeju-home-hero";
import { TimeCapsuleDialog } from "@/features/overview/components/time-capsule-dialog";
import { IllustrationIcon } from "@/components/ui/illustration-icon";
import { useAppShellElement } from "@/components/layout/AppShell";
import { ILLUSTRATION } from "@/lib/illustrations";
import { HomePageSkeleton } from "@/components/ui/page-skeleton";
import { useTrip } from "@/features/trips/hooks";
import { cn } from "@/lib/utils";

export function OverviewTab({ tripId }: { tripId: string }) {
  const { data: trip } = useTrip(tripId);
  const { data: accommodations, isLoading: loadingAcc } = useAccommodations(tripId);
  const { data: transports, isLoading: loadingTr } = useTransports(tripId);
  const [capsuleOpen, setCapsuleOpen] = useState(false);
  const shell = useAppShellElement();

  if (!trip || loadingAcc || loadingTr) return <HomePageSkeleton />;

  const flights = (transports ?? []).filter((item) => item.type === "비행기");
  const fab = (
    <button
      type="button"
      aria-label="타임캡슐 열기"
      onClick={() => setCapsuleOpen(true)}
      className={cn(
        "pointer-events-auto absolute right-5 z-20 flex size-[60px] items-center justify-center rounded-full",
        "bottom-[calc(var(--trip-nav-height,56px)+16px)]",
        ILLUSTRATION.giftFab.bg,
        ILLUSTRATION.giftFab.shadow,
      )}
    >
      <IllustrationIcon src={ILLUSTRATION.gift} className="size-9" />
    </button>
  );

  return (
    <div className="relative mx-auto flex h-full min-h-0 w-full min-w-0 flex-col bg-white">
      <JejuHomeHero
        trip={trip}
        flights={flights}
        stays={accommodations ?? []}
        footer={
          flights.length === 0 || (accommodations ?? []).length === 0 ? (
            <div className="flex flex-wrap gap-2">
              {flights.length === 0 ? <AddTransportDialog tripId={tripId} /> : null}
              {(accommodations ?? []).length === 0 ? (
                <AddAccommodationDialog
                  tripId={tripId}
                  tripStartDate={trip.startDate}
                  tripEndDate={trip.endDate}
                />
              ) : null}
            </div>
          ) : null
        }
      />
      {shell ? createPortal(fab, shell) : null}
      <TimeCapsuleDialog tripId={tripId} open={capsuleOpen} onOpenChange={setCapsuleOpen} />
    </div>
  );
}
