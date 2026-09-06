"use client";

import { useState } from "react";
import { ViewTransition } from "react";
import { Pencil } from "lucide-react";
import { formatDateRange, formatDuration } from "@/lib/date";
import type { Trip } from "@/mocks/fixtures/trips";
import { EditTripDialog } from "@/features/trips/components/edit-trip-dialog";

export function TripHeader({ trip }: { trip: Trip }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="size-9" aria-hidden="true" />
        <ViewTransition name={`trip-cover-${trip.id}`}>
          <h1 className="truncate text-base font-semibold text-foreground">
            {trip.coverEmoji} {trip.title}
          </h1>
        </ViewTransition>
        <button
          type="button"
          aria-label="여행 편집"
          onClick={() => setEditOpen(true)}
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground"
        >
          <Pencil className="size-4" />
        </button>
      </div>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        {formatDuration(trip.startDate, trip.endDate)} ·{" "}
        {formatDateRange(trip.startDate, trip.endDate)} · {trip.companions}
      </p>
      <EditTripDialog trip={trip} open={editOpen} onOpenChange={setEditOpen} />
    </header>
  );
}
