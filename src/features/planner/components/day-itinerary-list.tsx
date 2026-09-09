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
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { estimateWalkLeg, legCacheKey } from "@/lib/travel-leg";
import { useTravelLegs } from "@/features/planner/hooks";
import { useReorderDayPlaces } from "@/features/places/hooks";
import type { Place } from "@/mocks/fixtures/places";
import type { TravelLeg } from "@/lib/travel-leg";

const CATEGORY_ICON: Record<Place["category"], string> = {
  관광: "🏛️",
  맛집: "🍽️",
  카페: "☕",
  쇼핑: "🛍️",
  액티비티: "🎢",
  기타: "📍",
};

function SortableItem({ place, index }: { place: Place; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: place.id,
  });
  const hours = place.durationMin ? `${Math.floor(place.durationMin / 60)}h ${place.durationMin % 60}m` : null;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-3xl bg-card p-3 shadow-sm ring-1 ring-border",
        isDragging && "shadow-lg opacity-90",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label={`${place.name} 순서 변경 (드래그)`}
        className="touch-callout-none flex flex-col items-center text-muted-foreground"
      >
        <span className="text-[10px]">▲</span>
        <GripVertical className="size-4" />
        <span className="text-[10px]">▼</span>
      </button>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#E8F4FF] text-lg">
        {CATEGORY_ICON[place.category]}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-bold text-foreground">{place.name}</p>
          <span className="rounded-full bg-[#E3F4FA] px-2 py-0.5 text-[10px] font-bold text-[#3A7CA5]">
            {place.category === "맛집" ? "식당" : place.category}
          </span>
          {hours ? <span className="text-[11px] text-muted-foreground">{hours}</span> : null}
        </div>
        {place.memo ? <p className="truncate text-xs font-bold text-[#FF893B]">{place.memo}</p> : null}
        {place.address ? <p className="truncate text-xs text-muted-foreground">{place.address}</p> : null}
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
  const resolved = leg ?? estimateWalkLeg(from, to);
  if (resolved.source === "naver" && resolved.mode === "car") {
    return (
      <p className="mx-auto my-1 w-fit rounded-full bg-[#E2FBE9] px-2 py-0.5 text-xs font-bold text-[#2E7D57]">
        🚗 {resolved.durationMin}분
      </p>
    );
  }
  return (
      <p className="mx-auto my-1 w-fit rounded-full bg-[#E2FBE9] px-2 py-0.5 text-xs font-bold text-[#2E7D57]">
        🚶 ~{resolved.durationMin}분
      </p>
  );
}

export function DayItineraryList({ tripId, places }: { tripId: string; places: Place[] }) {
  const [items, setItems] = useState(places);
  const reorder = useReorderDayPlaces(tripId);
  const { data: legs } = useTravelLegs(items);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // 부모(usePlaces) 데이터가 바뀌면(다른 곳에서 갱신 등) 동기화한다.
  // id·길이뿐 아니라 내용(카테고리·비용 등 편집)도 비교해야 한다 —
  // id/length만 보면 편집 후 화면이 낡은 스냅샷에 멈춰 있는 버그가 있었다
  // (features/wishlist/components/memo-tab.tsx에서 같은 패턴으로 발견).
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
      <p className="p-4 text-center text-sm text-muted-foreground">
        아직 일정이 없어요. 리스트 탭에서 후보를 가져오세요.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 py-2">
          <p className="text-center text-[11px] text-muted-foreground">
            오른쪽 줄을 눌러 위아래로 순서를 바꿔
          </p>
          {legs && Object.keys(legs).length > 0 && (
            <p className="text-center text-xs text-muted-foreground">
              이동 합계{" "}
              {Math.round(Object.values(legs).reduce((sum, leg) => sum + leg.distanceM, 0) / 100) /
                10}
              km · {Object.values(legs).reduce((sum, leg) => sum + leg.durationMin, 0)}분
            </p>
          )}
          {items.map((place, index) => {
            const next = items[index + 1];
            const fromLat = place.lat;
            const fromLng = place.lng;
            const toLat = next?.lat;
            const toLng = next?.lng;
            const canShowLeg =
              fromLat != null && fromLng != null && toLat != null && toLng != null;

            return (
              <div key={place.id}>
                <SortableItem place={place} index={index} />
                {canShowLeg && (
                  <TravelTimePill
                    from={{ lat: fromLat, lng: fromLng }}
                    to={{ lat: toLat, lng: toLng }}
                    leg={legs?.[legCacheKey({ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng })]}
                  />
                )}
              </div>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
