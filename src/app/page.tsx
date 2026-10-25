"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTrips } from "@/features/trips/hooks";
import { mainTrip } from "@/features/trips/main-trip";

/** "/"는 여행이 있으면 그 상세로 바로 보낸다. */
export default function RootPage() {
  const router = useRouter();
  const { data: trips } = useTrips();
  const trip = trips ? mainTrip(trips) : undefined;

  useEffect(() => {
    if (trip) router.replace(`/trips/${trip.id}`);
  }, [router, trip]);

  return null;
}
