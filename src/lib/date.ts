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

export function todayIsoSeoul(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

/** 오늘 기준 D-day. 출발 전 D-n, 당일 D-Day, 여행 중 출발일 기준 D+n, 종료 다음날부터 귀국일 기준 D+n. */
export function formatDday(startDate: string, endDate: string, todayIso?: string): string {
  const today = todayIso ?? todayIsoSeoul();
  if (today < startDate) return `D-${calcNights(today, startDate)}`;
  if (today === startDate) return "D-Day";
  if (today <= endDate) return `D+${calcNights(startDate, today)}`;
  return `D+${calcNights(endDate, today)}`;
}

/** D-day 카드 위 라벨. */
export function formatDdayCaption(startDate: string, endDate: string, todayIso?: string): string {
  const today = todayIso ?? todayIsoSeoul();
  if (today < startDate) return "비행기 뜨는 날까지";
  if (today === startDate) return "출발일";
  if (today <= endDate) return "여행 중";
  return "다녀온 지";
}

/** 타임캡슐 카드용. 예: 10월 14일 오후 3:00 */
export function formatSeoulDateTime(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
