"use client";

import {
  useAccommodations,
  useDeleteAccommodation,
  useDeleteTransport,
  useTransports,
} from "@/features/overview/hooks";
import { AccommodationCard } from "@/features/overview/components/accommodation-card";
import { TransportCard } from "@/features/overview/components/transport-card";
import { AddAccommodationDialog } from "@/features/overview/components/add-accommodation-dialog";
import { AddTransportDialog } from "@/features/overview/components/add-transport-dialog";
import { JejuHomeHero } from "@/features/overview/components/jeju-home-hero";
import { SummaryStats } from "@/features/overview/components/summary-stats";
import { usePlaces } from "@/features/places/hooks";
import { useExpenses } from "@/features/expenses/hooks";
import { useTrip } from "@/features/trips/hooks";
import { useState } from "react";
import type { Accommodation, Transport } from "@/mocks/fixtures/overview";

export function OverviewTab({ tripId }: { tripId: string }) {
  const { data: trip } = useTrip(tripId);
  const { data: accommodations, isLoading: loadingAcc } = useAccommodations(tripId);
  const { data: transports, isLoading: loadingTr } = useTransports(tripId);
  const deleteAccommodation = useDeleteAccommodation(tripId);
  const deleteTransport = useDeleteTransport(tripId);
  const { data: places } = usePlaces(tripId);
  const { data: expenses } = useExpenses(tripId);
  const [editingAcc, setEditingAcc] = useState<Accommodation | null>(null);
  const [editingTr, setEditingTr] = useState<Transport | null>(null);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 p-4">
      {trip ? (
        <JejuHomeHero
          trip={trip}
          flight={transports?.find((item) => item.type === "비행기")}
        />
      ) : null}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">🏨 숙소</h2>
          <AddAccommodationDialog
            tripId={tripId}
            tripStartDate={trip?.startDate}
            tripEndDate={trip?.endDate}
          />
        </div>
        {loadingAcc && <p className="text-sm text-muted-foreground">불러오는 중…</p>}
        {!loadingAcc && accommodations?.length === 0 && (
          <p className="text-sm text-muted-foreground">등록된 숙소가 없습니다.</p>
        )}
        {accommodations?.map((acc) => (
          <AccommodationCard
            key={acc.id}
            accommodation={acc}
            onEdit={() => setEditingAcc(acc)}
            onDelete={() => deleteAccommodation.mutate(acc.id)}
          />
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">✈️ 교통</h2>
          <AddTransportDialog tripId={tripId} />
        </div>
        {loadingTr && <p className="text-sm text-muted-foreground">불러오는 중…</p>}
        {!loadingTr && transports?.length === 0 && (
          <p className="text-sm text-muted-foreground">등록된 교통편이 없습니다.</p>
        )}
        {transports?.map((tr) => (
          <TransportCard
            key={tr.id}
            transport={tr}
            onEdit={() => setEditingTr(tr)}
            onDelete={() => deleteTransport.mutate(tr.id)}
          />
        ))}
      </section>

      <SummaryStats
        accommodations={accommodations ?? []}
        transports={transports ?? []}
        places={places ?? []}
        expenses={expenses ?? []}
      />
      {editingAcc && (
        <AddAccommodationDialog
          tripId={tripId}
          tripStartDate={trip?.startDate}
          tripEndDate={trip?.endDate}
          initial={editingAcc}
          open
          onOpenChange={(next) => {
            if (!next) setEditingAcc(null);
          }}
        />
      )}
      {editingTr && (
        <AddTransportDialog
          tripId={tripId}
          initial={editingTr}
          open
          onOpenChange={(next) => {
            if (!next) setEditingTr(null);
          }}
        />
      )}
    </div>
  );
}
