import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  latLngSchema,
  legCacheKey,
  resolveDisplayedLeg,
  travelLegSchema,
  type TravelLeg,
} from "@/lib/travel-leg";
import type { Place } from "@/mocks/fixtures/places";

const responseSchema = z.object({
  legs: z.array(travelLegSchema),
});

const clientLegCache: Record<string, TravelLeg> = {};

export function adjacentCoordPairs(places: Place[]) {
  const pairs: Array<{ start: z.infer<typeof latLngSchema>; end: z.infer<typeof latLngSchema> }> =
    [];
  for (let i = 0; i < places.length - 1; i += 1) {
    const a = places[i];
    const b = places[i + 1];
    if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) continue;
    pairs.push({
      start: { lat: a.lat, lng: a.lng },
      end: { lat: b.lat, lng: b.lng },
    });
  }
  return pairs;
}

export function useTravelLegs(places: Place[]) {
  const pairs = adjacentCoordPairs(places);

  const query = useQuery({
    queryKey: ["directions", "adjacent", pairs],
    enabled: pairs.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Record<string, TravelLeg>> => {
      const fallback = () =>
        Object.fromEntries(
          pairs.map(({ start, end }) => [legCacheKey(start, end), resolveDisplayedLeg(null, start, end)]),
        );
      const res = await fetch("/api/directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legs: pairs }),
      });
      if (!res.ok) return fallback();
      const data = responseSchema.parse(await res.json());
      if (data.legs.length !== pairs.length) return fallback();
      return Object.fromEntries(
        pairs.map(({ start, end }, i) => [legCacheKey(start, end), data.legs[i]]),
      );
    },
  });

  if (query.data) {
    for (const [key, leg] of Object.entries(query.data)) {
      clientLegCache[key] = leg;
    }
  }

  const data: Record<string, TravelLeg> = {};
  for (const { start, end } of pairs) {
    const key = legCacheKey(start, end);
    const leg = query.data?.[key] ?? clientLegCache[key];
    if (leg) data[key] = leg;
  }

  return { ...query, data };
}
