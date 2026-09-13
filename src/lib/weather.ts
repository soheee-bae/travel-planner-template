import { ILLUSTRATION } from "@/lib/illustrations";

export type WeatherLabel = keyof typeof ILLUSTRATION.weather;

const WEATHER_EMOJI: Record<WeatherLabel, string> = {
  맑음: "☀️",
  "구름 조금": "⛅",
  흐림: "☁️",
  비: "🌧️",
  눈: "🌨️",
  소나기: "🌦️",
  뇌우: "⛈️",
};

export function describeWeather(code: number): {
  label: WeatherLabel;
  emoji: string;
  icon: string;
} {
  let label: WeatherLabel;
  if (code === 0) label = "맑음";
  else if (code === 1 || code === 2) label = "구름 조금";
  else if (code === 3 || code === 45 || code === 48) label = "흐림";
  else if (code >= 51 && code <= 67) label = "비";
  else if ((code >= 71 && code <= 77) || code === 85 || code === 86) label = "눈";
  else if (code >= 80 && code <= 82) label = "소나기";
  else if (code >= 95) label = "뇌우";
  else label = "구름 조금";

  return {
    label,
    emoji: WEATHER_EMOJI[label],
    icon: ILLUSTRATION.weather[label],
  };
}
