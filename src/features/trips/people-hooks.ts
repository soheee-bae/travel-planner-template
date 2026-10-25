import { useQuery } from "@tanstack/react-query";
import { fetchTripPeople } from "@/features/trips/people-api";

export function tripPeopleKey(tripId: string) {
  return ["trip-people", tripId] as const;
}

export function useTripPeople(tripId: string) {
  return useQuery({
    queryKey: tripPeopleKey(tripId),
    queryFn: () => fetchTripPeople(tripId),
    enabled: tripId.length > 0,
  });
}
