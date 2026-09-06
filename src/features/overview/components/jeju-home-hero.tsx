"use client";

import { TangerineMascot } from "@/features/overview/components/tangerine-mascot";
import { formatDateRange, formatDday, formatDuration } from "@/lib/date";
import type { Transport } from "@/mocks/fixtures/overview";
import type { Trip } from "@/mocks/fixtures/trips";

function formatFlightTime(iso: string): string {
  const time = iso.split("T")[1];
  return time ? time.slice(0, 5) : "";
}

export function JejuHomeHero({ trip, flight }: { trip: Trip; flight?: Transport }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-3 rounded-[1.75rem] bg-[#FFF1D6] px-4 py-3 ring-2 ring-[#3D2B1F]/10">
        <TangerineMascot className="size-20 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#E38B29]">커플 · 생일 기념</p>
          <h2 className="font-heading text-lg font-bold text-[#3D2B1F]">{trip.title}</h2>
          <p className="text-xs text-[#7A6452]">
            {formatDuration(trip.startDate, trip.endDate)} ·{" "}
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-[1.5rem] bg-[#FFE0C2] p-4 ring-2 ring-[#3D2B1F]/10">
          <p className="text-xs font-bold text-[#C45C26]">여행까지</p>
          <p className="font-heading text-2xl font-extrabold text-[#3D2B1F]">
            {formatDday(trip.startDate, trip.endDate)}
          </p>
          <p className="text-[11px] text-[#7A6452]">남자친구 생일 기념</p>
        </div>
        <div className="rounded-[1.5rem] bg-[#D9EFFF] p-4 ring-2 ring-[#3D2B1F]/10">
          <p className="text-xs font-bold text-[#3A7CA5]">제주 날씨</p>
          <p className="font-heading text-2xl font-extrabold text-[#3D2B1F]">22°</p>
          <p className="text-[11px] text-[#7A6452]">맑음 · 바람 약함</p>
        </div>
      </div>

      <div className="rounded-[1.5rem] bg-card p-4 ring-2 ring-[#3D2B1F]/10">
        <p className="mb-3 text-xs font-bold text-[#3D2B1F]">비행기 티켓</p>
        {flight ? (
          <div className="relative overflow-hidden rounded-[1.25rem] bg-[#FFF7EA] px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[#7A6452]">출발</p>
                <p className="text-lg font-extrabold text-[#3D2B1F]">{flight.departureFrom}</p>
                <p className="text-xs text-[#7A6452]">{formatFlightTime(flight.departureAt)}</p>
              </div>
              <p className="text-sm font-bold text-[#E38B29]">✈</p>
              <div className="text-right">
                <p className="text-[11px] text-[#7A6452]">도착</p>
                <p className="text-lg font-extrabold text-[#3D2B1F]">{flight.arrivalTo}</p>
                <p className="text-xs text-[#7A6452]">{formatFlightTime(flight.arrivalAt)}</p>
              </div>
            </div>
            <div className="my-3 border-t-2 border-dashed border-[#E8D9C4]" />
            <p className="text-[11px] text-[#7A6452]">
              {flight.bookingRef ? `예약 ${flight.bookingRef} · ` : ""}
              {flight.departureAt.slice(0, 10)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">교통에서 항공편을 추가하면 여기에 티켓이 보여.</p>
        )}
      </div>
    </section>
  );
}
