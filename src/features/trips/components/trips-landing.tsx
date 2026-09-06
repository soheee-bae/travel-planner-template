"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Fab } from "@/components/ui/fab";
import { useTrips } from "@/features/trips/hooks";
import { TripCard } from "@/features/trips/components/trip-card";
import { TripListSkeleton } from "@/features/trips/components/trip-list-skeleton";
import { AppBottomNav } from "@/features/trips/components/app-bottom-nav";
import { cn } from "@/lib/utils";

type Filter = "다가오는" | "지난";

export function TripsLanding() {
  const { data: trips, isLoading, isError } = useTrips();
  const [filter, setFilter] = useState<Filter>("다가오는");
  const today = new Date().toISOString().slice(0, 10);

  const visible = useMemo(() => {
    const list = trips ?? [];
    if (filter === "다가오는") return list.filter((t) => t.endDate >= today);
    return list.filter((t) => t.endDate < today);
  }, [trips, filter, today]);

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 pb-24">
        <h1 className="font-serif text-2xl font-semibold text-foreground">✈️ 나의 여행</h1>

        <div className="flex gap-2">
          {(["다가오는", "지난"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-full px-3 py-1 text-sm",
                filter === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {key}
            </button>
          ))}
        </div>

        {isLoading && <TripListSkeleton />}

        {isError && <p className="text-sm text-destructive">여행 목록을 불러오지 못했습니다.</p>}

        {!isLoading && !isError && visible.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {filter === "다가오는" ? "예정된 여행이 없어요" : "지난 여행이 없어요"}
            </p>
          </div>
        )}

        {!isLoading && !isError && visible.map((trip) => <TripCard key={trip.id} trip={trip} />)}
      </main>

      <Fab href="/trips/new" label="여행 추가">
        <Plus className="size-6" aria-hidden="true" />
      </Fab>

      <AppBottomNav />
    </>
  );
}
