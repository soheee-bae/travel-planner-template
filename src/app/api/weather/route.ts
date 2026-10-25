import { NextResponse } from "next/server";
import { describeWeather } from "@/lib/weather";

const NOMINATIM_BASE_URL = process.env.NOMINATIM_BASE_URL ?? "https://nominatim.openstreetmap.org";

function nominatimUserAgent(): string {
  const configured = process.env.NOMINATIM_USER_AGENT?.trim();
  if (configured && !configured.includes("example.com")) return configured;
  return "TravelPlanner/0.1 (personal trip template; contact: local-dev)";
}

async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  const url = new URL("/search", NOMINATIM_BASE_URL);
  url.searchParams.set("q", city);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  const res = await fetch(url, {
    headers: { "User-Agent": nominatimUserAgent() },
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) return null;
  const results = (await res.json()) as Array<{ lat: string; lon: string }>;
  const first = results[0];
  if (!first) return null;
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export async function GET(request: Request) {
  const city = new URL(request.url).searchParams.get("city")?.trim() ?? "";
  if (!city) {
    return NextResponse.json({ error: "city_required" }, { status: 400 });
  }
  const point = await geocodeCity(city);
  if (!point) {
    return NextResponse.json({ error: "weather_unavailable" }, { status: 502 });
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(point.lat));
  url.searchParams.set("longitude", String(point.lng));
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min");
  url.searchParams.set("timezone", "Asia/Seoul");
  url.searchParams.set("forecast_days", "1");

  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) {
    return NextResponse.json({ error: "weather_unavailable" }, { status: 502 });
  }

  const data = (await res.json()) as {
    current?: { temperature_2m?: number; weather_code?: number };
    daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[] };
  };

  const code = data.current?.weather_code ?? 2;
  const desc = describeWeather(code);

  return NextResponse.json({
    region: city,
    date: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" }),
    temperature: Math.round(data.current?.temperature_2m ?? 22),
    high: Math.round(data.daily?.temperature_2m_max?.[0] ?? 24),
    low: Math.round(data.daily?.temperature_2m_min?.[0] ?? 16),
    label: desc.label,
    emoji: desc.emoji,
    icon: desc.icon,
  });
}
