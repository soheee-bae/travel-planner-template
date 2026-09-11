/** 앱 URL·MSW 시드의 제주 여행 id. DB `trips.id`는 UUID만 허용한다. */
export const JEJU_TRIP_SLUG = "trip_jeju";
export const JEJU_TRIP_UUID = "00000000-0000-0000-0001-000000000001";

export function toDbTripId(tripId: string): string {
  return tripId === JEJU_TRIP_SLUG ? JEJU_TRIP_UUID : tripId;
}

export function toClientTripId(dbTripId: string): string {
  return dbTripId === JEJU_TRIP_UUID ? JEJU_TRIP_SLUG : dbTripId;
}
