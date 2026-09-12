"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { PLACE_CATEGORY_EMOJI } from "@/mocks/fixtures/places";
import { visitNumbers } from "@/lib/visit-order";
import type { Place } from "@/mocks/fixtures/places";

export function PlannerDayCarousel({
  places,
  activeDayIndex,
  selectedPlaceId,
  onSelectPlace,
}: {
  places: Place[];
  activeDayIndex: number;
  selectedPlaceId?: string;
  onSelectPlace: (placeId: string) => void;
}) {
  const numbers = visitNumbers(places, activeDayIndex);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedPlaceId) return;
    const card = scrollerRef.current?.querySelector(`[data-place-id="${selectedPlaceId}"]`);
    if (card instanceof HTMLElement) {
      card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [selectedPlaceId]);

  if (places.length === 0) {
    return (
      <p className="px-5 py-4 text-center text-[13px] leading-5 text-[#8E8E8E]">
        이날은 텅 비어있네? 귤 까먹는 날 🍊
      </p>
    );
  }

  return (
    <div
      ref={scrollerRef}
      className="flex w-full snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="이날 장소"
    >
      {places.map((place) => {
        const selected = selectedPlaceId === place.id;
        const number = numbers.get(place.id);
        return (
          <button
            key={place.id}
            type="button"
            data-place-id={place.id}
            onClick={() => onSelectPlace(place.id)}
            aria-pressed={selected}
            className={cn(
              "flex w-[78%] shrink-0 snap-center flex-col items-start rounded-[20px] bg-white px-4 py-3 text-left shadow-[0px_2px_12px_rgba(0,0,0,0.06)]",
              selected && "ring-2 ring-[#FF9F43]",
            )}
          >
            <p className="w-full truncate text-[14px] leading-[21px] font-bold text-[#1A1A1A]">
              {number != null ? `${number}. ` : ""}
              {place.name} {PLACE_CATEGORY_EMOJI[place.category]}
            </p>
            {place.address ? (
              <p className="mt-0.5 w-full truncate text-[12px] leading-[18px] text-[#8C8885]">
                {place.address}
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
