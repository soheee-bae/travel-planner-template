/** "1시간 30분", "90분", "1h 30m", "90" → 분. 빈 값·해석 불가면 undefined. */
export function parseDurationText(raw: string | undefined): number | undefined {
  if (raw == null) return undefined;
  const text = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (!text) return undefined;
  if (/^\d+$/.test(text)) {
    const minutes = Number(text);
    return Number.isFinite(minutes) && minutes > 0 ? minutes : undefined;
  }

  const colon = text.match(/^(\d+):([0-5]?\d)$/);
  if (colon) {
    const total = Number(colon[1]) * 60 + Number(colon[2]);
    return total > 0 ? total : undefined;
  }

  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(h|시간)/);
  const minMatch = text.match(/(\d+(?:\.\d+)?)\s*(m|분)/);
  if (!hourMatch && !minMatch) return undefined;

  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minMatch ? Number(minMatch[1]) : 0;
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return undefined;
  const total = Math.round(hours * 60 + minutes);
  return total > 0 ? total : undefined;
}

export function formatDurationText(min?: number): string {
  if (min == null || min <= 0) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
}

/** 이동시간 표기. 60분 이상이면 시간+분. */
export function formatTravelDuration(min: number): string {
  return formatDurationText(min) || "1분";
}
