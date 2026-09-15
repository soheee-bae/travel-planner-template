import { z } from "zod";
import { estimateWalkMinutes, haversineDistanceMeters } from "@/lib/geo";

export const travelLegSchema = z.object({
  durationMin: z.number().int().positive(),
  distanceM: z.number().nonnegative(),
  source: z.enum(["naver", "estimate"]),
  mode: z.enum(["car", "walk"]),
});
export type TravelLeg = z.infer<typeof travelLegSchema>;

export const latLngSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type LatLng = z.infer<typeof latLngSchema>;

const DETOUR_FACTOR = 1.3;
const WALK_SPEED_KMH = 4.5;
/** 네이버 Directions가 없을 때 쓰는 시내 평균 속도. */
const ESTIMATE_CAR_SPEED_KMH = 30;
const CAR_WALK_THRESHOLD_MIN = 3;

export function estimateWalkLeg(a: LatLng, b: LatLng): TravelLeg {
  return {
    durationMin: estimateWalkMinutes(a, b),
    distanceM: Math.round(haversineDistanceMeters(a, b) * DETOUR_FACTOR),
    source: "estimate",
    mode: "walk",
  };
}

export function estimateCarLeg(a: LatLng, b: LatLng): TravelLeg {
  const distanceM = Math.round(haversineDistanceMeters(a, b) * DETOUR_FACTOR);
  const durationMin = Math.max(1, Math.round((distanceM / 1000 / ESTIMATE_CAR_SPEED_KMH) * 60));
  return {
    durationMin,
    distanceM,
    source: "estimate",
    mode: "car",
  };
}

export function walkLegFromDistanceM(
  distanceM: number,
  source: TravelLeg["source"],
): TravelLeg {
  const meters = Math.max(0, Math.round(distanceM));
  const durationMin = Math.max(1, Math.round((meters / 1000 / WALK_SPEED_KMH) * 60));
  return {
    durationMin,
    distanceM: meters,
    source,
    mode: "walk",
  };
}

/** Directions 5 `summary.duration`은 밀리초다. */
export function drivingSummaryToLeg(distanceM: number, durationMs: number): TravelLeg {
  return {
    durationMin: Math.max(1, Math.round(durationMs / 60_000)),
    distanceM: Math.max(0, Math.round(distanceM)),
    source: "naver",
    mode: "car",
  };
}

/** 자차 우선. 3분 이하면 같은 거리로 도보 시간을 보여준다. */
export function resolveDisplayedLeg(car: TravelLeg | null, start: LatLng, end: LatLng): TravelLeg {
  const driving = car?.mode === "car" ? car : estimateCarLeg(start, end);
  if (driving.durationMin > CAR_WALK_THRESHOLD_MIN) return driving;
  if (driving.source === "naver") return walkLegFromDistanceM(driving.distanceM, "naver");
  return estimateWalkLeg(start, end);
}

/** 캐시·쿼리 키용. 소수 5자리 ≈ 1.1m (docs/06 §6.5). */
export function roundCoord(value: number): number {
  return Math.round(value * 1e5) / 1e5;
}

export function legCacheKey(a: LatLng, b: LatLng): string {
  return `${roundCoord(a.lat)},${roundCoord(a.lng)}>${roundCoord(b.lat)},${roundCoord(b.lng)}`;
}
