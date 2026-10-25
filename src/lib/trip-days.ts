export interface TripDay {
  dayIndex: number; // 1부터 시작
  date: string; // yyyy-mm-dd
}

/**
 * 여행 기간(시작~종료일)에서 Day 목록을 파생한다. 별도로 저장하지 않는다 —
 * 날짜가 바뀌면 그냥 다시 계산하면 되므로, "Day를 지우면 거기 있던 장소가
 * 고아가 되는" 문제 자체가 mock 단계에서는 생기지 않는다(docs/09 D8 참고,
 * 실제 배정은 Phase 5~6에서 place.dayIndex로 연결한다).
 */
export const DEFAULT_TRIP_NIGHTS = 2;

function parseLocalIso(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatLocalIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function getTripDays(startDate: string, endDate: string): TripDay[] {
  const start = parseLocalIso(startDate);
  const end = parseLocalIso(endDate);
  if (!start || !end || end < start) return [];

  const days: TripDay[] = [];
  const cursor = new Date(start);
  let dayIndex = 1;
  while (cursor <= end) {
    days.push({ dayIndex, date: formatLocalIso(cursor) });
    cursor.setDate(cursor.getDate() + 1);
    dayIndex += 1;
  }
  return days;
}

/** 날짜가 없으면 2박 3일. 있으면 시작일~종료일로 Day를 만든다. */
export function resolveTripDays(startDate?: string | null, endDate?: string | null): TripDay[] {
  const days = startDate && endDate ? getTripDays(startDate, endDate) : [];
  if (days.length > 0) return days;
  const start = formatLocalIso(new Date());
  return getTripDays(start, endDateFromNights(start, DEFAULT_TRIP_NIGHTS));
}

/** 시작일 + 박수로 종료일을 계산한다 ("박수 ↔ 날짜 양방향 동기화"). */
export function endDateFromNights(startDate: string, nights: number): string {
  const start = parseLocalIso(startDate);
  if (!start) return startDate;
  const end = new Date(start);
  end.setDate(end.getDate() + Math.max(0, nights));
  return formatLocalIso(end);
}
