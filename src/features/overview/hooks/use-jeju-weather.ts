"use client";

import { useQuery } from "@tanstack/react-query";
import { todayIsoSeoul } from "@/lib/date";

export type JejuWeather = {
  region: string;
  date: string;
  temperature: number;
  high: number;
  low: number;
  label: string;
  emoji: string;
  icon: string;
};

export function useJejuWeather(city: string) {
  const today = todayIsoSeoul();
  const region = city.trim();
  return useQuery({
    queryKey: ["weather", region, today],
    enabled: region.length > 0,
    queryFn: async (): Promise<JejuWeather> => {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(region)}`);
      if (!res.ok) throw new Error("weather");
      return (await res.json()) as JejuWeather;
    },
    staleTime: 30 * 60 * 1000,
  });
}
