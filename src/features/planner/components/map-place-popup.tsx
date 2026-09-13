"use client";

import { NaverPlaceLink } from "@/features/planner/components/naver-place-link";
import type { Place } from "@/mocks/fixtures/places";

export function MapPlacePopup({ place, onClose }: { place: Place; onClose: () => void }) {
  const lat = place.lat;
  const lng = place.lng;

  return (
    <div
      className="absolute inset-x-2 bottom-2 z-20 flex items-start gap-2 rounded-[16px] bg-white px-3 py-2.5 shadow-[0px_2px_12px_rgba(0,0,0,0.12)]"
      role="dialog"
      aria-label={place.name}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] leading-[21px] font-bold text-[#1A1A1A]">
          {place.name}
        </p>
        {lat != null && lng != null ? (
          <NaverPlaceLink
            lat={lat}
            lng={lng}
            name={place.name}
            className="mt-0.5 inline-flex items-center text-[12px] leading-[18px] font-semibold text-[#FF9F43]"
          >
            네이버 지도에서 보기
          </NaverPlaceLink>
        ) : (
          <p className="mt-0.5 text-[12px] leading-[18px] text-[#8E8E8E]">좌표가 없어 네이버 지도를 못 열어</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 px-1 text-[12px] font-semibold text-[#AAAAAA]"
        aria-label="팝업 닫기"
      >
        닫기
      </button>
    </div>
  );
}
