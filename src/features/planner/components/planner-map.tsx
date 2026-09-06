"use client";

import { useCallback, useState } from "react";
import { getNaverMapClientId } from "@/lib/naver-maps-script";
import { MockMap } from "@/features/planner/components/mock-map";
import { NaverPlannerMap } from "@/features/planner/components/naver-planner-map";
import type { Place } from "@/mocks/fixtures/places";

export function PlannerMap({
  places,
  activeDayIndex,
  selectedPlaceId,
  onSelectPlace,
}: {
  places: Place[];
  activeDayIndex: number | "all";
  selectedPlaceId?: string;
  onSelectPlace?: (placeId: string) => void;
}) {
  const clientId = getNaverMapClientId();
  const [useMock, setUseMock] = useState(!clientId);
  const onFatalError = useCallback(() => setUseMock(true), []);

  if (useMock || !clientId) {
    return (
      <MockMap
        places={places}
        activeDayIndex={activeDayIndex}
        selectedPlaceId={selectedPlaceId}
        onSelectPlace={onSelectPlace}
      />
    );
  }

  return (
    <NaverPlannerMap
      clientId={clientId}
      places={places}
      activeDayIndex={activeDayIndex}
      selectedPlaceId={selectedPlaceId}
      onSelectPlace={onSelectPlace}
      onFatalError={onFatalError}
    />
  );
}
