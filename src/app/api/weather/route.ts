import { NextResponse } from "next/server";

const JEJU = { lat: 33.4996, lng: 126.5312 };

type WeatherCode = number;

function describeWeather(code: WeatherCode): { label: string; emoji: string } {
  if (code === 0) return { label: "맑음", emoji: "☀️" };
  if (code <= 3) return { label: "구름 조금", emoji: "⛅" };
  if (code <= 48) return { label: "흐림", emoji: "☁️" };
  if (code <= 67) return { label: "비", emoji: "🌧️" };
  if (code <= 77) return { label: "눈", emoji: "🌨️" };
  if (code <= 82) return { label: "소나기", emoji: "🌦️" };
  if (code >= 95) return { label: "뇌우", emoji: "⛈️" };
  return { label: "구름 조금", emoji: "⛅" };
}

export async function GET() {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(JEJU.lat));
  url.searchParams.set("longitude", String(JEJU.lng));
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
    region: "제주",
    date: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" }),
    temperature: Math.round(data.current?.temperature_2m ?? 22),
    high: Math.round(data.daily?.temperature_2m_max?.[0] ?? 24),
    low: Math.round(data.daily?.temperature_2m_min?.[0] ?? 16),
    label: desc.label,
    emoji: desc.emoji,
  });
}
