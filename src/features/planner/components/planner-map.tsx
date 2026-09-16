"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNaverMapClientId } from "@/lib/naver-maps-script";
import { MockMap } from "@/features/planner/components/mock-map";
import { NaverPlannerMap } from "@/features/planner/components/naver-planner-map";
import { MapPlacePopup } from "@/features/planner/components/map-place-popup";
import { cn } from "@/lib/utils";
import type { Place } from "@/mocks/fixtures/places";

function isClientIdPayload(value: unknown): value is { clientId: string | null } {
  return typeof value === "object" && value !== null && "clientId" in value;
}

function useNaverMapClientId() {
  const builtIn = getNaverMapClientId();
  const remote = useQuery({
    queryKey: ["naver-map-client-id"],
    queryFn: async (): Promise<string | null> => {
      const res = await fetch("/api/maps/ncp-client-id");
      if (!res.ok) return null;
      const data: unknown = await res.json();
      if (!isClientIdPayload(data)) return null;
      return typeof data.clientId === "string" && data.clientId.length > 0 ? data.clientId : null;
    },
    staleTime: Infinity,
  });
  return {
    clientId: builtIn ?? remote.data ?? undefined,
    pending: !builtIn && (remote.isPending || remote.isFetching),
  };
}

export function PlannerMap({
  places,
  activeDayIndex,
  selectedPlaceId,
  onSelectPlace,
  onToggleExpand,
  expanded = false,
  visible = true,
  showPopup = true,
  focusNonce = 0,
}: {
  places: Place[];
  activeDayIndex: number;
  selectedPlaceId?: string;
  onSelectPlace?: (placeId: string | null) => void;
  onToggleExpand?: () => void;
  expanded?: boolean;
  visible?: boolean;
  showPopup?: boolean;
  focusNonce?: number;
}) {
  const { clientId, pending } = useNaverMapClientId();
  const [loadFailed, setLoadFailed] = useState(false);
  const onFatalError = useCallback(() => setLoadFailed(true), []);
  const selectedPlace = places.find((p) => p.id === selectedPlaceId);
  const showMock = !pending && (loadFailed || !clientId);

  return (
    <div className="relative h-full min-h-[180px] w-full">
      {pending ? (
        <div className="h-full w-full bg-[#dbe4d8]" aria-hidden="true" />
      ) : showMock || !clientId ? (
        <MockMap
          places={places}
          activeDayIndex={activeDayIndex}
          selectedPlaceId={selectedPlaceId}
          onSelectPlace={onSelectPlace}
          expanded={expanded}
        />
      ) : visible ? (
        <NaverPlannerMap
          clientId={clientId}
          places={places}
          activeDayIndex={activeDayIndex}
          selectedPlaceId={selectedPlaceId}
          onSelectPlace={onSelectPlace}
          onFatalError={onFatalError}
          visible={visible}
          focusNonce={focusNonce}
          expanded={expanded}
        />
      ) : (
        <div className="h-full w-full bg-[#dbe4d8]" aria-hidden="true" />
      )}
      {showMock ? (
        <p className="pointer-events-none absolute top-2 left-2 z-20 max-w-[68%] rounded-[10px] bg-white/95 px-2 py-1 text-[10px] leading-[14px] font-medium text-[#6B6560] shadow-[0px_2px_8px_rgba(0,0,0,0.08)]">
          {clientId
            ? "네이버 지도를 못 불러와서 임시 지도야"
            : "네이버 지도 키가 없어 임시 지도야"}
        </p>
      ) : null}
      {showPopup && selectedPlace ? (
        <MapPlacePopup place={selectedPlace} onClose={() => onSelectPlace?.(null)} />
      ) : null}
      {onToggleExpand ? (
        <button
          type="button"
          onClick={onToggleExpand}
          aria-label={expanded ? "지도 접기" : "지도 크게 보기"}
          aria-pressed={expanded}
          className={cn(
            "absolute top-2 right-2 z-20 flex size-9 items-center justify-center rounded-[12px] bg-white/95 text-[#4A4543] shadow-[0px_2px_12px_rgba(0,0,0,0.12)]",
          )}
        >
          {expanded ? (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M9 9 4 4m0 0h5M4 4v5m11 6 5 5m0 0h-5m5 0v-5M9 15l-5 5m0 0h5M4 20v-5m11-6 5-5m0 0h-5m5 0v5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M9 3H4v5M15 3h5v5M9 21H4v-5M21 16v5h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      ) : null}
    </div>
  );
}
