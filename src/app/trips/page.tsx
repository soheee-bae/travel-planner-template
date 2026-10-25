"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TripsLanding } from "@/features/trips/components/trips-landing";
import { useTrips } from "@/features/trips/hooks";

/** 여행이 하나면 그 여행으로 들어가고, 여러 개면 목록을 보여 준다. */
export default function TripsPage() {
  const router = useRouter();
  const { data: trips, isLoading } = useTrips();

  useEffect(() => {
    if (trips?.length === 1) {
      router.replace(`/trips/${trips[0].id}`);
    }
  }, [router, trips]);

  if (isLoading || trips?.length === 1) return null;
  return <TripsLanding />;
}
