"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePlaces, useUpdatePlace } from "@/features/places/hooks";
import { PlannerMap } from "@/features/planner/components/planner-map";
import { nextOrderIndexForDay } from "@/lib/visit-order";
import {
  PlannerDayTabs,
  type PlannerDaySelection,
} from "@/features/planner/components/planner-day-tabs";
import { DaySheet } from "@/features/planner/components/day-sheet";
import { DayItineraryList } from "@/features/planner/components/day-itinerary-list";
import { AutoPlaceDialog } from "@/features/planner/components/auto-place-dialog";
import { getTripDays } from "@/lib/trip-days";
import type { Trip } from "@/mocks/fixtures/trips";

export function PlannerTab({ trip }: { trip: Trip }) {
  const { data: places, isLoading, isError } = usePlaces(trip.id);
  const updatePlace = useUpdatePlace(trip.id);
  const [activeDay, setActiveDay] = useState<PlannerDaySelection>(1);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>();

  const days = getTripDays(trip.startDate, trip.endDate);

  const dayItems = useMemo(() => {
    if (!places || activeDay === "all") return [];
    return places
      .filter((p) => p.dayIndex === activeDay)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [places, activeDay]);

  const selectedPlace = places?.find((p) => p.id === selectedPlaceId);
  const showAssignBar = selectedPlace && selectedPlace.dayIndex == null;

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">불러오는 중…</p>;
  if (isError)
    return <p className="p-6 text-sm text-destructive">장소 목록을 불러오지 못했습니다.</p>;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="px-4 pt-4 font-heading text-xl font-bold">📅 여행 플래너</h2>
      <PlannerDayTabs
        startDate={trip.startDate}
        endDate={trip.endDate}
        active={activeDay}
        onChange={(day) => {
          setActiveDay(day);
          setSelectedPlaceId(undefined);
        }}
      />

      <div className="flex flex-1 flex-col gap-2">
        <div className="mx-3 overflow-hidden rounded-3xl bg-[#D9F3F0] p-2">
          <p className="pb-1 text-center text-xs font-bold">🗺️ 지도 보기</p>
          <PlannerMap
            places={places ?? []}
            activeDayIndex={activeDay}
            selectedPlaceId={selectedPlaceId}
            onSelectPlace={setSelectedPlaceId}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {showAssignBar && (
            <div className="mx-3 flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border p-2 text-sm">
              <span className="text-foreground">{selectedPlace.name}을</span>
              {days.map((day) => (
                <Button
                  key={day.dayIndex}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updatePlace.mutate({
                      id: selectedPlace.id,
                      patch: {
                        dayIndex: day.dayIndex,
                        orderIndex: nextOrderIndexForDay(places ?? [], day.dayIndex),
                      },
                    });
                    setSelectedPlaceId(undefined);
                  }}
                >
                  Day{day.dayIndex}에 추가
                </Button>
              ))}
            </div>
          )}

          {activeDay === "all" && (
            <div className="mx-3">
              <AutoPlaceDialog
                tripId={trip.id}
                startDate={trip.startDate}
                endDate={trip.endDate}
                places={places ?? []}
              />
            </div>
          )}

          {activeDay !== "all" && (
            <DaySheet>
              <DayItineraryList tripId={trip.id} places={dayItems} />
            </DaySheet>
          )}
        </div>
      </div>
    </div>
  );
}
