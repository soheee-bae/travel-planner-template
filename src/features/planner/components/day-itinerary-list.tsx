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
import { Car, Footprints } from "lucide-react";
import { legCacheKey } from "@/lib/travel-leg";
import { formatTravelDuration } from "@/lib/duration-text";
import { useReorderDayPlaces } from "@/features/places/hooks";
import { PlaceSpotCard } from "@/features/places/components/place-spot-card";
import { useTravelLegs } from "@/features/planner/hooks";
import type { Place } from "@/mocks/fixtures/places";
import type { TravelLeg } from "@/lib/travel-leg";

function samePlaceOrder(a: Place[], b: Place[]): boolean {
  return a.length === b.length && a.every((place, index) => place.id === b[index]?.id);
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
        zIndex: isDragging ? 20 : undefined,
      }}
      className="flex w-full flex-col gap-2.5"
    >
      <PlaceSpotCard
        place={place}
        selectionMode={selectionMode}
        selected={selected}
        showDragHandle={sortable}
        highlighted={highlighted && !isDragging}
        className={isDragging ? "shadow-[0px_12px_28px_rgba(0,0,0,0.18)] ring-2 ring-[#FF9F43]" : undefined}
        onToggleSelect={onToggleSelect}
        onActivate={onActivate}
        onEdit={onEdit}
        onDelete={onDelete}
        dragBind={canDrag ? { attributes, listeners } : undefined}
      />
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
  return (
    <div className="flex h-[25px] w-full items-center justify-center">
      <span className="inline-flex h-[25px] items-center justify-center gap-1 rounded-[99px] bg-[#FFF0DB] px-2.5 py-1 text-[11px] leading-none font-semibold text-[#F49A1F]">
        {leg.mode === "walk" ? (
          <Footprints className="size-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
        ) : (
          <Car className="size-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
        )}
        <span className="leading-none">{formatTravelDuration(leg.durationMin)}</span>
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
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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
