import { ViewTransition } from "react";
import Link from "next/link";
import { formatDateRange, formatDday, formatDuration } from "@/lib/date";
import type { Trip } from "@/mocks/fixtures/trips";

export function TripCard({ trip }: { trip: Trip }) {
  const shared = trip.role === "editor";

  return (
    <Link
      href={`/trips/${trip.id}`}
      prefetch
      className="block rounded-lg border border-border bg-card p-4 transition-colors active:bg-muted"
    >
      <ViewTransition name={`trip-cover-${trip.id}`}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-base font-semibold text-foreground">
              {trip.coverEmoji} {trip.title}
            </p>
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              {shared ? "공유됨" : "내 여행"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDuration(trip.startDate, trip.endDate)} ·{" "}
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
          <p className="text-sm text-muted-foreground">
            {trip.companions} · {formatDday(trip.startDate, trip.endDate)}
          </p>
        </div>
      </ViewTransition>
    </Link>
  );
}
