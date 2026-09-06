import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  estimateWalkLeg,
  latLngSchema,
  legCacheKey,
  travelLegSchema,
  type TravelLeg,
} from "@/lib/travel-leg";
import type { Place } from "@/mocks/fixtures/places";

const responseSchema = z.object({
  legs: z.array(travelLegSchema),
});

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

  return useQuery({
    queryKey: ["directions", "adjacent", pairs],
    enabled: pairs.length > 0,
    queryFn: async (): Promise<Record<string, TravelLeg>> => {
      const fallback = () =>
        Object.fromEntries(
          pairs.map(({ start, end }) => [legCacheKey(start, end), estimateWalkLeg(start, end)]),
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
    staleTime: 30 * 60 * 1000,
  });
}
