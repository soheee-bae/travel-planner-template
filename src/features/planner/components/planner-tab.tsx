"use client";

import { useMemo, useState } from "react";
import { FigmaCtaButton, FigmaChip, FigmaChipRow, FigmaPage, FigmaPageHeader, FigmaPageTitle } from "@/components/ui/figma";
import { useConfirmDelete } from "@/components/ui/confirm-delete-dialog";
import { usePlaces, useUpdatePlace, useDeletePlace } from "@/features/places/hooks";
import { PlannerMap } from "@/features/planner/components/planner-map";
import { nextOrderIndexForDay } from "@/lib/visit-order";
import { PlannerDayTabs } from "@/features/planner/components/planner-day-tabs";
import { DayItineraryList } from "@/features/planner/components/day-itinerary-list";
import { AddPlaceDialog } from "@/features/places/components/add-place-dialog";
import { getTripDays } from "@/lib/trip-days";
import type { Trip } from "@/mocks/fixtures/trips";
import type { Place } from "@/mocks/fixtures/places";

export function PlannerTab({ trip }: { trip: Trip }) {
  const { data: places, isLoading, isError } = usePlaces(trip.id);
  const updatePlace = useUpdatePlace(trip.id);
  const deletePlace = useDeletePlace(trip.id);
  const { request: askDelete, dialog: confirmDialog } = useConfirmDelete();
  const [activeDay, setActiveDay] = useState(1);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Place | null>(null);

  const days = getTripDays(trip.startDate, trip.endDate);

  const dayItems = useMemo(() => {
    if (!places) return [];
    return places
      .filter((p) => p.dayIndex === activeDay)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [places, activeDay]);

  const unassigned = useMemo(
    () => (places ?? []).filter((p) => p.dayIndex == null),
    [places],
  );

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelected(new Set());
  }

  function assignSelected(dayIndex: number | null) {
    if (selected.size === 0) return;
    if (dayIndex == null) {
      selected.forEach((id) => updatePlace.mutate({ id, patch: { dayIndex: null } }));
    } else {
      let next = nextOrderIndexForDay(places ?? [], dayIndex);
      selected.forEach((id) => {
        updatePlace.mutate({ id, patch: { dayIndex, orderIndex: next } });
        next += 1;
      });
    }
    exitSelectionMode();
  }

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">불러오는 중…</p>;
  if (isError)
    return <p className="p-6 text-sm text-destructive">장소 목록을 다시 불러와 주세요.</p>;

  return (
    <div className="flex min-h-full flex-col bg-white">
      <FigmaPageHeader>
        <div className="flex w-full items-center justify-between">
          <FigmaPageTitle className="w-auto flex-1 font-nunito">오늘의 느긋한 동선</FigmaPageTitle>
          <button
            type="button"
            className="shrink-0 text-[13px] leading-5 font-semibold text-[#8C8885]"
            aria-pressed={selectionMode}
            onClick={() => {
              if (selectionMode) exitSelectionMode();
              else setSelectionMode(true);
            }}
          >
            {selectionMode ? "취소" : "선택"}
          </button>
        </div>
      </FigmaPageHeader>
      <FigmaPage>
        <PlannerDayTabs
          startDate={trip.startDate}
          endDate={trip.endDate}
          active={activeDay}
          onChange={(day) => {
            setActiveDay(day);
            exitSelectionMode();
          }}
        />

        <div className="relative h-[180px] min-h-[180px] w-full overflow-hidden rounded-[20px] bg-[#dbe4d8] shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
          <PlannerMap
            places={places ?? []}
            activeDayIndex={activeDay}
            selectedPlaceId={[...selected][0]}
            onSelectPlace={(id) => {
              if (selectionMode) toggleSelect(id);
            }}
          />
        </div>

        {selectionMode ? (
          <div className="flex w-full flex-col gap-2.5">
            <span className="text-[13px] leading-5 text-[#8E8E8E]" aria-live="polite">
              {selected.size}개 선택됨
            </span>
            <FigmaChipRow role="group" aria-label="선택 장소 이동">
              <FigmaChip
                size="sm"
                disabled={selected.size === 0}
                onClick={() => assignSelected(null)}
                aria-label="선택한 장소를 미배정으로"
              >
                미배정
              </FigmaChip>
              {days.map((day) => (
                <FigmaChip
                  key={day.dayIndex}
                  size="sm"
                  disabled={selected.size === 0}
                  onClick={() => assignSelected(day.dayIndex)}
                  aria-label={`선택한 장소를 Day ${day.dayIndex}에 추가`}
                >
                  Day {day.dayIndex}
                </FigmaChip>
              ))}
            </FigmaChipRow>
          </div>
        ) : null}

        <DayItineraryList
          tripId={trip.id}
          places={dayItems}
          selectionMode={selectionMode}
          selected={selected}
          onToggleSelect={toggleSelect}
          onEdit={(place) => setEditing(place)}
          onDelete={(place) => askDelete(() => deletePlace.mutate(place.id))}
        />

        {selectionMode && unassigned.length > 0 ? (
          <div className="flex w-full flex-col gap-2.5">
            <p className="text-[13px] leading-5 font-semibold text-[#AAAAAA]">미배정</p>
            <DayItineraryList
              tripId={trip.id}
              places={unassigned}
              selectionMode
              selected={selected}
              onToggleSelect={toggleSelect}
              sortable={false}
              onEdit={(place) => setEditing(place)}
              onDelete={(place) => askDelete(() => deletePlace.mutate(place.id))}
            />
          </div>
        ) : null}

        <FigmaCtaButton onClick={() => setAddOpen(true)}>+ 여기 가볼까?</FigmaCtaButton>
        <AddPlaceDialog
          tripId={trip.id}
          startDate={trip.startDate}
          endDate={trip.endDate}
          existingPlaces={places ?? []}
          hideTrigger
          open={addOpen}
          onOpenChange={setAddOpen}
          defaultDayIndex={activeDay}
          onSaved={(saved) => {
            if (saved.dayIndex != null) setActiveDay(saved.dayIndex);
          }}
        />
        {editing ? (
          <AddPlaceDialog
            tripId={trip.id}
            startDate={trip.startDate}
            endDate={trip.endDate}
            initial={editing}
            existingPlaces={places ?? []}
            hideTrigger
            open
            onOpenChange={(next) => {
              if (!next) setEditing(null);
            }}
          />
        ) : null}
        {confirmDialog}
      </FigmaPage>
    </div>
  );
}
