"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FigmaCtaButton, FigmaChip, FigmaChipRow, FigmaPage, FigmaPageHeader, FigmaPageTitle } from "@/components/ui/figma";
import { useConfirmDelete } from "@/components/ui/confirm-delete-dialog";
import { useAppShellElement } from "@/components/layout/AppShell";
import { usePlaces, useUpdatePlace, useDeletePlace } from "@/features/places/hooks";
import { PlannerMap } from "@/features/planner/components/planner-map";
import { PlannerDayCarousel } from "@/features/planner/components/planner-day-carousel";
import { nextOrderIndexForDay, placesOnDay } from "@/lib/visit-order";
import { PlannerDayTabs } from "@/features/planner/components/planner-day-tabs";
import { DayItineraryList } from "@/features/planner/components/day-itinerary-list";
import { AddPlaceDialog } from "@/features/places/components/add-place-dialog";
import { adjacentCoordPairs, useTravelLegs } from "@/features/planner/hooks";
import { getTripDays } from "@/lib/trip-days";
import type { Trip } from "@/mocks/fixtures/trips";
import type { Place } from "@/mocks/fixtures/places";

export function PlannerTab({ trip }: { trip: Trip }) {
  const { data: places, isLoading, isError } = usePlaces(trip.id);
  const updatePlace = useUpdatePlace(trip.id);
  const deletePlace = useDeletePlace(trip.id);
  const { request: askDelete, dialog: confirmDialog } = useConfirmDelete();
  const shell = useAppShellElement();
  const [activeDay, setActiveDay] = useState(1);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [highlightId, setHighlightId] = useState<string>();
  const [mapExpanded, setMapExpanded] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Place | null>(null);

  const days = getTripDays(trip.startDate, trip.endDate);
  const allPlaces = places ?? [];

  const dayItems = useMemo(() => placesOnDay(allPlaces, activeDay), [allPlaces, activeDay]);
  const travelLegs = useTravelLegs(dayItems);
  const blockingTravel =
    adjacentCoordPairs(dayItems).length > 0 &&
    travelLegs.isLoading &&
    Object.keys(travelLegs.data).length === 0;

  const unassigned = useMemo(
    () => allPlaces.filter((p) => p.dayIndex == null),
    [allPlaces],
  );

  useEffect(() => {
    if (!mapExpanded) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMapExpanded(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mapExpanded]);

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
      let next = nextOrderIndexForDay(allPlaces, dayIndex);
      selected.forEach((id) => {
        updatePlace.mutate({ id, patch: { dayIndex, orderIndex: next } });
        next += 1;
      });
    }
    exitSelectionMode();
  }

  function handleMapSelect(placeId: string | null) {
    if (selectionMode) {
      if (placeId) toggleSelect(placeId);
      return;
    }
    setHighlightId(placeId ?? undefined);
  }

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">불러오는 중…</p>;
  if (isError)
    return (
      <p className="p-6 text-[12px] leading-[18px] font-semibold text-[#E85D4C]">
        장소 목록을 다시 불러와 주세요.
      </p>
    );

  const map = (
    <PlannerMap
      places={allPlaces}
      activeDayIndex={activeDay}
      selectedPlaceId={selectionMode ? [...selected][0] : highlightId}
      onSelectPlace={handleMapSelect}
      onToggleExpand={() => setMapExpanded((prev) => !prev)}
      expanded={mapExpanded}
      showPopup={!selectionMode && !mapExpanded}
    />
  );

  const expandedMap =
    mapExpanded && shell
      ? createPortal(
          <div
            className="pointer-events-auto absolute inset-0 z-50 flex flex-col bg-white"
            role="dialog"
            aria-modal="true"
            aria-label="큰 지도"
          >
            <div className="flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2">
              <p className="text-[15px] font-bold text-[#1A1A1A]">Day {activeDay} 동선</p>
              <button
                type="button"
                className="text-[13px] font-semibold text-[#8C8885]"
                onClick={() => setMapExpanded(false)}
              >
                접기
              </button>
            </div>
            <div className="px-4 pb-2">
              <PlannerDayTabs
                startDate={trip.startDate}
                endDate={trip.endDate}
                active={activeDay}
                onChange={(day) => {
                  setActiveDay(day);
                  setHighlightId(undefined);
                  exitSelectionMode();
                }}
              />
            </div>
            <div className="relative isolate z-0 min-h-0 flex-1 overflow-hidden">{map}</div>
            <div className="relative z-10 shrink-0 bg-[#FAFAFA] pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
              <PlannerDayCarousel
                places={dayItems}
                activeDayIndex={activeDay}
                selectedPlaceId={highlightId}
                onSelectPlace={(id) => setHighlightId(id)}
              />
            </div>
          </div>,
          shell,
        )
      : null;

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
            setHighlightId(undefined);
            exitSelectionMode();
          }}
        />

        <div className="relative h-[180px] min-h-[180px] w-full overflow-hidden rounded-[20px] bg-[#dbe4d8] shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
          {mapExpanded ? <div className="h-full w-full bg-[#dbe4d8]" aria-hidden="true" /> : map}
        </div>
        {expandedMap}

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
          legs={travelLegs.data}
          selectionMode={selectionMode}
          selected={selected}
          highlightedId={highlightId}
          sortable
          onToggleSelect={toggleSelect}
          onHighlight={setHighlightId}
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
          existingPlaces={allPlaces}
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
            existingPlaces={allPlaces}
            hideTrigger
            open
            onOpenChange={(next) => {
              if (!next) setEditing(null);
            }}
          />
        ) : null}
        {confirmDialog}
      </FigmaPage>
      {blockingTravel && shell
        ? createPortal(
            <div
              className="pointer-events-auto absolute inset-0 z-[60] flex flex-col items-center justify-center gap-3 bg-white/80"
              role="status"
              aria-live="assertive"
              aria-busy="true"
              aria-label="거리 계산 중"
            >
              <span
                className="size-9 animate-spin rounded-full border-2 border-[#FF9F43] border-t-transparent"
                aria-hidden="true"
              />
              <p className="text-[14px] font-semibold text-[#4A4543]">거리 계산 중</p>
            </div>,
            shell,
          )
        : null}
    </div>
  );
}
