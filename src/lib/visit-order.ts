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

export function nextOrderIndexForDay(places: Place[], dayIndex: number): number {
  const onDay = places.filter((p) => p.dayIndex === dayIndex);
  if (onDay.length === 0) return 0;
  return Math.max(...onDay.map((p) => p.orderIndex)) + 1;
}
