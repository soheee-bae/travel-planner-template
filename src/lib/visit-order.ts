import type { Place } from "@/mocks/fixtures/places";

/** 그날 일정 순서(1부터). dayIndex가 아니라 리스트와 같은 방문 순번이다. */
export function visitNumbers(places: Place[], day: number | "all"): Map<string, number> {
  const numbers = new Map<string, number>();
  const days =
    day === "all"
      ? [...new Set(places.map((p) => p.dayIndex).filter((d): d is number => d != null))].sort(
          (a, b) => a - b,
        )
      : [day];

  for (const d of days) {
    const ordered = places
      .filter((p) => p.dayIndex === d)
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex);
    ordered.forEach((place, index) => {
      numbers.set(place.id, index + 1);
    });
  }
  return numbers;
}

export function placesOnDay(places: Place[], day: number): Place[] {
  return places
    .filter((p) => p.dayIndex === day)
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export function placesOnDayWithCoords(places: Place[], day: number): Place[] {
  return placesOnDay(places, day).filter((p) => p.lat != null && p.lng != null);
}

export function placesWithCoords(places: Place[]): Place[] {
  return places.filter((p) => p.lat != null && p.lng != null);
}

/** 이름·주소·카테고리가 같으면 같은 스팟으로 본다. */
export function placeSpotKey(place: Place): string {
  return `${place.name.trim()}\u0000${(place.address ?? "").trim()}\u0000${place.category}`;
}

function sortByDayThenOrder(a: Place, b: Place): number {
  const dayA = a.dayIndex ?? Number.MAX_SAFE_INTEGER;
  const dayB = b.dayIndex ?? Number.MAX_SAFE_INTEGER;
  if (dayA !== dayB) return dayA - dayB;
  return a.orderIndex - b.orderIndex;
}

/**
 * 지도 핀용. 같은 스팟이 여러 Day에 있으면 그날 일정을 우선하고, 없으면 하나면 남긴다.
 */
export function uniqueMapPlaces(
  places: Place[],
  activeDayIndex: number,
): { dayPlaces: Place[]; otherPlaces: Place[] } {
  const grouped = new Map<string, Place[]>();
  for (const place of placesWithCoords(places)) {
    const key = placeSpotKey(place);
    const group = grouped.get(key);
    if (group) group.push(place);
    else grouped.set(key, [place]);
  }

  const dayPlaces: Place[] = [];
  const otherPlaces: Place[] = [];
  for (const group of grouped.values()) {
    const ordered = group.slice().sort(sortByDayThenOrder);
    const onDay = ordered.find((place) => place.dayIndex === activeDayIndex);
    if (onDay) dayPlaces.push(onDay);
    else otherPlaces.push(ordered[0]);
  }
  dayPlaces.sort((a, b) => a.orderIndex - b.orderIndex);
  return { dayPlaces, otherPlaces };
}

export function isSameMapSpot(a: Place, b: Place): boolean {
  return placeSpotKey(a) === placeSpotKey(b);
}

export function isMapSpotSelected(spot: Place, places: Place[], selectedPlaceId?: string): boolean {
  if (!selectedPlaceId) return false;
  if (spot.id === selectedPlaceId) return true;
  const selected = places.find((place) => place.id === selectedPlaceId);
  return selected != null && isSameMapSpot(spot, selected);
}

export type SpotGroup = {
  representative: Place;
  members: Place[];
};

/** 스팟 목록용. 이름·주소·카테고리가 같으면 한 줄로 묶는다. */
export function groupedSpots(places: Place[]): SpotGroup[] {
  const grouped = new Map<string, Place[]>();
  for (const place of places) {
    const key = placeSpotKey(place);
    const group = grouped.get(key);
    if (group) group.push(place);
    else grouped.set(key, [place]);
  }
  return [...grouped.values()].map((members) => {
    const ordered = members.slice().sort(sortByDayThenOrder);
    return { representative: ordered[0], members: ordered };
  });
}

export function assignedDaysOf(members: Place[]): number[] {
  return [...new Set(members.map((place) => place.dayIndex).filter((day): day is number => day != null))].sort(
    (a, b) => a - b,
  );
}

export function nextOrderIndexForDay(places: Place[], dayIndex: number): number {
  const onDay = places.filter((p) => p.dayIndex === dayIndex);
  if (onDay.length === 0) return 0;
  return Math.max(...onDay.map((p) => p.orderIndex)) + 1;
}
