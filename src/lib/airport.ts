/** 출발/도착 문자열에서 IATA 코드를 뽑는다. DB 코드가 없을 때의 보정용. */
export function airportCodeFromName(name: string): string {
  if (name.includes("김포")) return "GMP";
  if (name.includes("제주")) return "CJU";
  if (name.includes("인천")) return "ICN";
  const trimmed = name.trim();
  if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toUpperCase();
  return trimmed.slice(0, 3).toUpperCase();
}

export function cityLabelFromName(name: string): string {
  if (name.includes("김포") || name.includes("서울")) return "김포";
  if (name.includes("제주")) return "제주";
  return name;
}
