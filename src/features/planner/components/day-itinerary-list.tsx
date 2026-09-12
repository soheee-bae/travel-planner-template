"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { DragHandle } from "@/components/ui/figma";
import { IconAction } from "@/components/ui/icon-action";
import { legCacheKey, resolveDisplayedLeg } from "@/lib/travel-leg";
import { formatTravelDuration } from "@/lib/duration-text";
import { useTravelLegs } from "@/features/planner/hooks";
import { useReorderDayPlaces } from "@/features/places/hooks";
import type { Place } from "@/mocks/fixtures/places";
import type { TravelLeg } from "@/lib/travel-leg";

const CATEGORY_ICON: Record<Place["category"], string> = {
  관광: "🏛️",
  맛집: "🍽️",
  카페: "☕",
  쇼핑: "🛍️",
  숙소: "🏨",
  교통: "🚗",
  기타: "📍",
};

const CATEGORY_ICON_BG: Record<Place["category"], string> = {
  관광: "bg-[#E3F4FA]",
  맛집: "bg-[#FFE8EF]",
  카페: "bg-[#FFE0BC]",
  쇼핑: "bg-[#F3E9FE]",
  숙소: "bg-[#E6F5F7]",
  교통: "bg-[#E9F0FE]",
  기타: "bg-[#F0F0F0]",
};

const CATEGORY_CHIP_BG: Record<Place["category"], string> = {
  관광: "bg-[#E3F4FA]",
  맛집: "bg-[#FFE8EF]",
  카페: "bg-[#FFE0BC]",
  쇼핑: "bg-[#F3E9FE]",
  숙소: "bg-[#E6F5F7]",
  교통: "bg-[#E9F0FE]",
  기타: "bg-[#F0F0F0]",
};

function formatStayDuration(min?: number): string | null {
  if (min == null) return null;
  return formatTravelDuration(min);
}

function SortableItem({
  place,
  selectionMode,
  selected,
  sortable,
  onToggleSelect,
  onEdit,
  onDelete,
}: {
  place: Place;
  selectionMode?: boolean;
  selected?: boolean;
  sortable: boolean;
  onToggleSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: place.id,
    disabled: !sortable || selectionMode,
  });
  const hours = formatStayDuration(place.durationMin);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex w-full flex-col items-start rounded-[20px] bg-white py-3 pr-3 pl-3.5 shadow-[0px_2px_12px_rgba(0,0,0,0.06)]",
        isDragging && "opacity-90 shadow-lg",
      )}
      onClick={selectionMode ? onToggleSelect : undefined}
    >
      <div className="flex w-full items-center gap-2">
        {selectionMode ? (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
            className="size-5 shrink-0"
            aria-label={`${place.name} 선택`}
          />
        ) : sortable ? (
          <button
            {...attributes}
            {...listeners}
            aria-label={`${place.name} 순서 변경 (드래그)`}
            className="touch-callout-none shrink-0"
          >
            <DragHandle label="" />
          </button>
        ) : null}
        <span
          className={cn(
            "flex size-[34px] shrink-0 items-center justify-center rounded-xl text-base",
            CATEGORY_ICON_BG[place.category],
          )}
        >
          {CATEGORY_ICON[place.category]}
        </span>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <p className="w-full min-w-0 truncate text-[14px] leading-[17px] font-bold text-[#1A1A1A]">
            {place.name}
          </p>
          <div className="flex h-[19px] w-full items-center gap-[5px]">
            <span
              className={cn(
                "flex h-[19px] items-center rounded-[99px] px-2 py-0.5 text-[10px] leading-[15px] font-semibold text-[#555555]",
                CATEGORY_CHIP_BG[place.category],
              )}
            >
              {place.category}
            </span>
            {hours ? (
              <span className="flex h-[17px] items-center font-nunito text-[11px] leading-4 font-normal text-[#B0AAA6]">
                {hours}
              </span>
            ) : null}
          </div>
          {place.address ? (
            <p className="flex h-[19px] items-center text-[11px] leading-4 font-normal text-[#B0AAA6]">
              {place.address}
            </p>
          ) : null}
          {place.memo ? (
            <p className="flex h-[17px] w-full items-center text-[11px] leading-4 font-medium text-[#FF9F43]">
              {place.memo}
            </p>
          ) : null}
        </div>
        {!selectionMode ? (
          <div className="flex h-[50px] w-[41px] shrink-0 flex-col items-center justify-center gap-[7px]">
            {onEdit ? <IconAction action="edit" label={`${place.name} 수정`} onClick={onEdit} /> : null}
            {onDelete ? (
              <IconAction action="delete" label={`${place.name} 삭제`} onClick={onDelete} />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TravelTimePill({
  from,
  to,
  leg,
}: {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  leg?: TravelLeg;
}) {
  const resolved = resolveDisplayedLeg(leg ?? null, from, to);
  const icon = resolved.mode === "walk" ? "🚶" : "🚗";
  return (
    <div className="flex h-[25px] w-full items-center justify-center">
      <span className="flex h-[25px] items-center justify-center gap-[5px] rounded-[99px] bg-[#FFF0DB] px-2.5 py-1 text-[11px] leading-4 font-semibold text-[#F49A1F]">
        {icon} {formatTravelDuration(resolved.durationMin)}
      </span>
    </div>
  );
}

export function DayItineraryList({
  tripId,
  places,
  selectionMode,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
  sortable = true,
}: {
  tripId: string;
  places: Place[];
  selectionMode?: boolean;
  selected?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onEdit?: (place: Place) => void;
  onDelete?: (place: Place) => void;
  sortable?: boolean;
}) {
  const [items, setItems] = useState(places);
  const reorder = useReorderDayPlaces(tripId);
  const { data: legs } = useTravelLegs(items);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (JSON.stringify(items) !== JSON.stringify(places)) {
    setItems(places);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((p) => p.id === active.id);
    const newIndex = items.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    reorder.mutate(reordered.map((p) => p.id));
  }

  if (items.length === 0) {
    return (
      <p className="w-full py-4 text-center text-[13px] leading-5 text-[#8E8E8E]">
        이날은 텅 비어있네? 귤 까먹는 날 🍊
      </p>
    );
  }

  const list = (
    <div className="flex w-full flex-col items-start gap-2.5">
      {items.map((place, index) => {
        const next = items[index + 1];
        const fromLat = place.lat;
        const fromLng = place.lng;
        const toLat = next?.lat;
        const toLng = next?.lng;
        const canShowLeg =
          !selectionMode && fromLat != null && fromLng != null && toLat != null && toLng != null;

        return (
          <div key={place.id} className="flex w-full flex-col gap-2.5">
            <SortableItem
              place={place}
              sortable={sortable}
              selectionMode={selectionMode}
              selected={selected?.has(place.id)}
              onToggleSelect={() => onToggleSelect?.(place.id)}
              onEdit={() => onEdit?.(place)}
              onDelete={() => onDelete?.(place)}
            />
            {canShowLeg ? (
              <TravelTimePill
                from={{ lat: fromLat, lng: fromLng }}
                to={{ lat: toLat, lng: toLng }}
                leg={legs?.[legCacheKey({ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng })]}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        {list}
      </SortableContext>
    </DndContext>
  );
}
