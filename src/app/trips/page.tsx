"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTrips } from "@/features/trips/hooks";
import { mainTrip } from "@/features/trips/main-trip";

/** /trips 목록은 두지 않는다. 여행이 있으면 상세로, 없으면 홈으로 보낸다. */
export default function TripsPage() {
  const router = useRouter();
  const { data: trips, isLoading } = useTrips();
  const trip = trips ? mainTrip(trips) : undefined;

  useEffect(() => {
    if (isLoading) return;
    router.replace(trip ? `/trips/${trip.id}` : "/");
  }, [isLoading, router, trip]);

  return null;
}
