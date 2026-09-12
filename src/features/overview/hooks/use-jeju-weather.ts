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
};

export function useJejuWeather() {
  const today = todayIsoSeoul();
  return useQuery({
    queryKey: ["weather", "jeju", today],
    queryFn: async (): Promise<JejuWeather> => {
      const res = await fetch("/api/weather");
      if (!res.ok) throw new Error("weather");
      return (await res.json()) as JejuWeather;
    },
    staleTime: 30 * 60 * 1000,
  });
}
