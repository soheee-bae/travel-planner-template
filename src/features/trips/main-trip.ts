import type { Trip } from "@/mocks/fixtures/trips";

/** 다가오는 여행이 있으면 가장 가까운 일정, 없으면 가장 최근 여행. */
export function mainTrip(trips: Trip[], today = new Date().toISOString().slice(0, 10)): Trip | undefined {
  const upcoming = trips
    .filter((trip) => trip.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (upcoming[0]) return upcoming[0];
  return [...trips].sort((a, b) => b.endDate.localeCompare(a.endDate))[0];
}
