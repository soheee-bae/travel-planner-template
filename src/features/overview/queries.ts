import { queryOptions } from "@tanstack/react-query";
import { fetchAccommodations, fetchTimeCapsules, fetchTransports } from "@/features/overview/api";

export const overviewKeys = {
  accommodations: (tripId: string) => ["trips", tripId, "accommodations"] as const,
  transports: (tripId: string) => ["trips", tripId, "transports"] as const,
  timeCapsules: (tripId: string) => ["trips", tripId, "time-capsules"] as const,
};

export const accommodationsQueryOptions = (tripId: string) =>
  queryOptions({
    queryKey: overviewKeys.accommodations(tripId),
    queryFn: () => fetchAccommodations(tripId),
  });

export const transportsQueryOptions = (tripId: string) =>
  queryOptions({
    queryKey: overviewKeys.transports(tripId),
    queryFn: () => fetchTransports(tripId),
  });

export const timeCapsulesQueryOptions = (tripId: string) =>
  queryOptions({
    queryKey: overviewKeys.timeCapsules(tripId),
    queryFn: () => fetchTimeCapsules(tripId),
  });
