/** ISO 날짜(yyyy-mm-dd) 두 개로 몇 박 며칠을 계산한다. */
export function calcNights(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

/** "2박 3일" 형태. 당일치기(0박)는 "1일"로 표기한다. */
export function formatDuration(startDate: string, endDate: string): string {
  const nights = calcNights(startDate, endDate);
  if (nights === 0) return "1일";
  return `${nights}박 ${nights + 1}일`;
}

/** "9월 15일~9월 17일" 형태. */
export function formatDateRange(startDate: string, endDate: string): string {
  const fmt = (iso: string) => {
    const [, m, d] = iso.split("-");
    return `${Number(m)}월 ${Number(d)}일`;
  };
  return `${fmt(startDate)}~${fmt(endDate)}`;
}

export function formatIsoDot(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}.${m}.${d}`;
}

/** 오늘 기준 D-day. 여행 당일은 D-Day, 지난 여행은 종료 후 경과일. */
export function formatDday(startDate: string, endDate: string, todayIso?: string): string {
  const today = todayIso ?? new Date().toISOString().slice(0, 10);
  if (today < startDate) {
    const days = calcNights(today, startDate);
    return `D-${days}`;
  }
  if (today <= endDate) return "여행 중";
  return "지난 여행";
}
