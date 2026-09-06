import { NextResponse } from "next/server";
import { geocodeWithNaver } from "@/lib/naver-maps";

const NOMINATIM_BASE_URL = process.env.NOMINATIM_BASE_URL ?? "https://nominatim.openstreetmap.org";
// Nominatim 이용 정책상 User-Agent 명시가 필수다 (docs/03-environments.md §3.3).
const USER_AGENT = process.env.NOMINATIM_USER_AGENT ?? "travel-planner-dev/0.1 (local development)";

async function geocodeWithNominatim(query: string) {
  const url = new URL("/search", NOMINATIM_BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 60 * 60 },
  });
  if (!res.ok) return null;

  const results = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;
  if (results.length === 0) return null;

  const [first] = results;
  return {
    lat: Number(first.lat),
    lng: Number(first.lon),
    displayName: first.display_name,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ message: "검색어(q)가 필요합니다." }, { status: 400 });
  }

  try {
    const naver = await geocodeWithNaver(query);
    if (naver) return NextResponse.json(naver);
  } catch {
    // 네이버 실패 시 Nominatim으로 이어간다.
  }

  try {
    const nominatim = await geocodeWithNominatim(query);
    if (nominatim) return NextResponse.json(nominatim);
    return NextResponse.json({ message: "검색 결과가 없습니다." }, { status: 404 });
  } catch {
    return NextResponse.json({ message: "지오코딩 요청에 실패했습니다." }, { status: 502 });
  }
}
