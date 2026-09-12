"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
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
import { legCacheKey } from "@/lib/travel-leg";
import { formatTravelDuration } from "@/lib/duration-text";
import { useReorderDayPlaces } from "@/features/places/hooks";
import { useTravelLegs } from "@/features/planner/hooks";
import { PLACE_CATEGORY_EMOJI, type Place } from "@/mocks/fixtures/places";
import type { TravelLeg } from "@/lib/travel-leg";

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

function samePlaceOrder(a: Place[], b: Place[]): boolean {
  return a.length === b.length && a.every((place, index) => place.id === b[index]?.id);
}

function formatStayDuration(min?: number): string | null {
  if (min == null) return null;
  return formatTravelDuration(min);
}

function PlaceCardBody({
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
  const hours = formatStayDuration(place.durationMin);
  return (
    <div className="flex w-full items-center gap-2">
      {selectionMode ? (
        <input
          type="checkbox"
          checked={!!selected}
          onChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="size-5 shrink-0"
          aria-label={`${place.name} 선택`}
        />
      ) : sortable ? (
        <span aria-hidden="true" className="shrink-0">
          <DragHandle label="" />
        </span>
      ) : null}
      <span
        className={cn(
          "flex size-[34px] shrink-0 items-center justify-center rounded-xl text-base",
          CATEGORY_ICON_BG[place.category],
        )}
      >
        {PLACE_CATEGORY_EMOJI[place.category]}
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
        <div
          className="flex h-[50px] w-[41px] shrink-0 flex-col items-center justify-center gap-[7px]"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {onEdit ? <IconAction action="edit" label={`${place.name} 수정`} onClick={onEdit} /> : null}
          {onDelete ? (
            <IconAction action="delete" label={`${place.name} 삭제`} onClick={onDelete} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SortableItem({
  place,
  selectionMode,
  selected,
  highlighted,
  sortable,
  onToggleSelect,
  onActivate,
  onEdit,
  onDelete,
  children,
}: {
  place: Place;
  selectionMode?: boolean;
  selected?: boolean;
  highlighted?: boolean;
  sortable: boolean;
  onToggleSelect?: () => void;
  onActivate?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
}) {
  const canDrag = sortable && !selectionMode;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: place.id,
    disabled: !canDrag,
    attributes: { role: "group" },
    animateLayoutChanges: () => false,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(
          transform && isDragging ? { ...transform, scaleX: 1.03, scaleY: 1.03 } : transform,
        ),
        transition: undefined,
        touchAction: canDrag ? "none" : undefined,
        zIndex: isDragging ? 20 : undefined,
      }}
      className="flex w-full flex-col gap-2.5"
    >
      <div
        className={cn(
          "relative w-full rounded-[20px] bg-white py-3 pr-3 pl-3.5 shadow-[0px_2px_12px_rgba(0,0,0,0.06)]",
          canDrag && "cursor-grab touch-callout-none",
          isDragging && "cursor-grabbing shadow-[0px_12px_28px_rgba(0,0,0,0.18)] ring-2 ring-[#FF9F43]",
          highlighted && !isDragging && "ring-2 ring-[#FF9F43]",
        )}
        {...(canDrag ? { ...attributes, ...listeners } : {})}
        aria-label={canDrag ? `${place.name} 순서 변경 (드래그)` : undefined}
        onClick={selectionMode ? onToggleSelect : onActivate}
      >
        <PlaceCardBody
          place={place}
          selectionMode={selectionMode}
          selected={selected}
          sortable={sortable}
          onToggleSelect={onToggleSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
      {children}
    </div>
  );
}

function TravelTimePill({ leg }: { leg?: TravelLeg }) {
  if (!leg) {
    return (
      <div className="flex h-[25px] w-full items-center justify-center">
        <span className="flex h-[25px] items-center justify-center rounded-[99px] bg-[#FFF0DB] px-2.5 py-1 text-[11px] leading-4 font-semibold text-[#F49A1F]">
          계산 중
        </span>
      </div>
    );
  }
  const icon = leg.mode === "walk" ? "🚶" : "🚗";
  return (
    <div className="flex h-[25px] w-full items-center justify-center">
      <span className="flex h-[25px] items-center justify-center gap-[5px] rounded-[99px] bg-[#FFF0DB] px-2.5 py-1 text-[11px] leading-4 font-semibold text-[#F49A1F]">
        {icon} {formatTravelDuration(leg.durationMin)}
      </span>
    </div>
  );
}

export function DayItineraryList({
  tripId,
  places,
  legs,
  selectionMode,
  selected,
  highlightedId,
  onToggleSelect,
  onHighlight,
  onEdit,
  onDelete,
  sortable = true,
}: {
  tripId: string;
  places: Place[];
  legs?: Record<string, TravelLeg>;
  selectionMode?: boolean;
  selected?: Set<string>;
  highlightedId?: string;
  onToggleSelect?: (id: string) => void;
  onHighlight?: (id: string) => void;
  onEdit?: (place: Place) => void;
  onDelete?: (place: Place) => void;
  sortable?: boolean;
}) {
  const skipClickRef = useRef(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localItems, setLocalItems] = useState<Place[] | null>(null);
  if (localItems && samePlaceOrder(localItems, places)) {
    setLocalItems(null);
  }
  const items = localItems ?? places;
  const reorder = useReorderDayPlaces(tripId);
  const travelLegs = useTravelLegs(items);
  const resolvedLegs = travelLegs.data;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(event: DragStartEvent) {
    skipClickRef.current = true;
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    window.setTimeout(() => {
      skipClickRef.current = false;
    }, 0);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((p) => p.id === active.id);
    const newIndex = items.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(items, oldIndex, newIndex);
    flushSync(() => {
      setLocalItems(reordered);
    });
    reorder.mutate(reordered.map((p) => p.id));
  }

  if (items.length === 0) {
    return (
      <p className="w-full py-4 text-center text-[13px] leading-5 text-[#8E8E8E]">
        이날은 텅 비어있네? 귤 까먹는 날 🍊
      </p>
    );
  }

  return (
    <div className="w-full" onPointerDown={(event) => event.stopPropagation()}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="flex w-full flex-col items-start gap-2.5">
            {items.map((place, index) => {
              const next = items[index + 1];
              const fromLat = place.lat;
              const fromLng = place.lng;
              const toLat = next?.lat;
              const toLng = next?.lng;
              const canShowLeg =
                !activeId &&
                !selectionMode &&
                fromLat != null &&
                fromLng != null &&
                toLat != null &&
                toLng != null;

              return (
                <SortableItem
                  key={place.id}
                  place={place}
                  sortable={sortable}
                  selectionMode={selectionMode}
                  selected={selected?.has(place.id)}
                  highlighted={highlightedId === place.id}
                  onToggleSelect={() => onToggleSelect?.(place.id)}
                  onActivate={() => {
                    if (skipClickRef.current) return;
                    onHighlight?.(place.id);
                  }}
                  onEdit={() => onEdit?.(place)}
                  onDelete={() => onDelete?.(place)}
                >
                  {canShowLeg ? (
                    <TravelTimePill
                      leg={
                        resolvedLegs[legCacheKey({ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng })] ??
                        legs?.[legCacheKey({ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng })]
                      }
                    />
                  ) : null}
                </SortableItem>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
