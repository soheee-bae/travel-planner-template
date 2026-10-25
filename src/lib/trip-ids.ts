/** 여행 id는 연결된 데이터베이스 값을 그대로 쓴다. */
export function toDbTripId(tripId: string): string {
  return tripId;
}

export function toClientTripId(dbTripId: string): string {
  return dbTripId;
}
