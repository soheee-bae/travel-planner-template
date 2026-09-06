"use client";

import { useState } from "react";
import { ViewTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Pencil, Trash2, Users } from "lucide-react";
import { formatDateRange, formatDuration } from "@/lib/date";
import type { Trip } from "@/mocks/fixtures/trips";
import { EditTripDialog } from "@/features/trips/components/edit-trip-dialog";
import { ShareTripDialog } from "@/features/trips/components/share-trip-dialog";
import { useDeleteTrip } from "@/features/trips/hooks";

export function TripHeader({ trip }: { trip: Trip }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const deleteTrip = useDeleteTrip();
  const isOwner = trip.role !== "editor";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between">
        <Link
          href="/trips"
          aria-label="여행 목록으로"
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <ViewTransition name={`trip-cover-${trip.id}`}>
          <h1 className="truncate text-base font-semibold text-foreground">
            {trip.coverEmoji} {trip.title}
          </h1>
        </ViewTransition>
        <div className="flex items-center">
          <button
            type="button"
            aria-label="여행 공유"
            onClick={() => setShareOpen(true)}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground"
          >
            <Users className="size-4" />
          </button>
          {isOwner && (
            <button
              type="button"
              aria-label="여행 편집"
              onClick={() => setEditOpen(true)}
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground"
            >
              <Pencil className="size-4" />
            </button>
          )}
          {isOwner && (
            <button
              type="button"
              aria-label="여행 삭제"
              onClick={() => {
                if (!window.confirm("이 여행을 삭제할까? 멤버도 더 이상 볼 수 없어.")) return;
                deleteTrip.mutate(trip.id, { onSuccess: () => router.replace("/trips") });
              }}
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        {formatDuration(trip.startDate, trip.endDate)} ·{" "}
        {formatDateRange(trip.startDate, trip.endDate)} · {trip.companions}
      </p>
      {isOwner && <EditTripDialog trip={trip} open={editOpen} onOpenChange={setEditOpen} />}
      <ShareTripDialog
        tripId={trip.id}
        isOwner={isOwner}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </header>
  );
}
