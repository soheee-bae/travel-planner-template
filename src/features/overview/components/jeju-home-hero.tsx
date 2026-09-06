"use client";

import { useMemo, useState } from "react";
import { formatDday, formatDuration } from "@/lib/date";
import { useJejuWeather } from "@/features/overview/hooks/use-jeju-weather";
import type { Accommodation, Transport } from "@/mocks/fixtures/overview";
import type { Trip } from "@/mocks/fixtures/trips";

function weekdayKo(iso: string): string {
  const day = new Date(`${iso}T00:00:00+09:00`).getDay();
  return ["일", "월", "화", "수", "목", "금", "토"][day] ?? "";
}

function formatMd(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}.${Number(d).toString().padStart(2, "0")}`;
}

function flightDuration(from: string, to: string): string {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return "";
  const min = Math.round((b - a) / 60000);
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function timeOf(iso: string): string {
  return iso.split("T")[1]?.slice(0, 5) ?? "";
}

function airportCode(name: string): string {
  if (name.includes("김포")) return "GMP";
  if (name.includes("제주")) return "CJU";
  if (name.includes("인천")) return "ICN";
  return name.slice(0, 3).toUpperCase();
}

export function JejuHomeHero({
  trip,
  flights,
  stays,
  rental,
}: {
  trip: Trip;
  flights: Transport[];
  stays: Accommodation[];
  rental?: Transport;
}) {
  const { data: weather } = useJejuWeather();
  const [flightIdx, setFlightIdx] = useState(0);
  const [stayIdx, setStayIdx] = useState(0);
  const outbound = flights[0];
  const inbound = flights[1];
  const activeFlight = flights[flightIdx] ?? outbound;
  const activeStay = stays[stayIdx] ?? stays[0];
  const today = useMemo(
    () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" }),
    [],
  );

  return (
    <section className="flex flex-col gap-3 pb-16">
      <header className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-[#FFF1D6] text-xl" aria-hidden>
          ☃️
        </span>
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-bold text-foreground">{trip.title}</h1>
          <p className="text-xs text-muted-foreground">
            {formatMd(trip.startDate)} - {formatMd(trip.endDate)} · {formatDuration(trip.startDate, trip.endDate)}{" "}
            {trip.coverEmoji}
          </p>
        </div>
      </header>

      <div className="rounded-[2rem] bg-primary px-5 py-5 text-primary-foreground shadow-sm">
        <p className="text-xs font-semibold opacity-90">출발까지</p>
        <p className="font-heading text-5xl font-bold tracking-tight">
          {formatDday(trip.startDate, trip.endDate)}
        </p>
        <p className="mt-1 text-sm opacity-90">
          {trip.startDate.slice(0, 4)}년 {Number(trip.startDate.slice(5, 7))}월{" "}
          {Number(trip.startDate.slice(8, 10))}일 ({weekdayKo(trip.startDate)})
        </p>
      </div>

      {activeFlight ? (
        <article className="overflow-hidden rounded-[1.75rem] bg-card shadow-sm ring-1 ring-border">
          <div className="flex gap-4 px-4 pt-3">
            {flights.map((flight, index) => (
              <button
                key={flight.id}
                type="button"
                onClick={() => setFlightIdx(index)}
                className={`pb-2 text-sm font-bold ${
                  index === flightIdx
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {index === 0 ? "출발편" : "귀국편"}
              </button>
            ))}
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading text-2xl font-bold">{airportCode(activeFlight.departureFrom)}</p>
                <p className="text-[11px] text-muted-foreground">{activeFlight.departureFrom}</p>
              </div>
              <div className="flex flex-1 flex-col items-center px-3">
                <p className="text-[11px] text-[#7BA3C9]">
                  {flightDuration(activeFlight.departureAt, activeFlight.arrivalAt)}
                </p>
                <p className="text-sm">✈️</p>
              </div>
              <div className="text-right">
                <p className="font-heading text-2xl font-bold">{airportCode(activeFlight.arrivalTo)}</p>
                <p className="text-[11px] text-muted-foreground">{activeFlight.arrivalTo}</p>
              </div>
            </div>
          </div>
          <div className="relative border-t border-dashed border-border px-5 py-3">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-[10px] text-muted-foreground">날짜</p>
                <p className="text-sm font-bold">{formatMd(activeFlight.departureAt.slice(0, 10))}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">출발</p>
                <p className="text-sm font-bold">{timeOf(activeFlight.departureAt)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">도착</p>
                <p className="text-sm font-bold">{timeOf(activeFlight.arrivalAt)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">항공사</p>
                <p className="text-sm font-bold">{activeFlight.bookingRef ?? "제주항공"}</p>
              </div>
            </div>
          </div>
          {inbound && outbound ? <span className="sr-only">{inbound.departureFrom}</span> : null}
        </article>
      ) : null}

      {activeStay ? (
        <article className="overflow-hidden rounded-[1.75rem] bg-card shadow-sm ring-1 ring-border">
          <div className="flex gap-4 px-4 pt-3">
            {stays.map((stay, index) => (
              <button
                key={stay.id}
                type="button"
                onClick={() => setStayIdx(index)}
                className={`pb-2 text-sm font-bold ${
                  index === stayIdx ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
                }`}
              >
                Day {index + 1}박 숙소
              </button>
            ))}
          </div>
          <div className="flex items-start gap-3 px-5 py-4">
            <span className="text-2xl" aria-hidden>
              🏨
            </span>
            <div>
              <p className="font-heading text-lg font-bold">{activeStay.name}</p>
              <p className="text-xs text-muted-foreground">{activeStay.memo ?? activeStay.address}</p>
            </div>
          </div>
          <div className="border-t border-dashed border-border px-5 py-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] text-muted-foreground">체크인</p>
                <p className="text-sm font-bold">
                  {formatMd(activeStay.checkinDate)} {activeStay.checkinTime}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">체크아웃</p>
                <p className="text-sm font-bold">
                  {formatMd(activeStay.checkoutDate)} {activeStay.checkoutTime}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">1박 요금</p>
                <p className="text-sm font-bold text-primary">
                  {activeStay.cost ? `${activeStay.cost.toLocaleString()}원` : "—"}
                </p>
              </div>
            </div>
          </div>
        </article>
      ) : null}

      {rental ? (
        <article className="rounded-[1.75rem] bg-card px-5 py-4 shadow-sm ring-1 ring-border">
          <p className="text-xs font-bold text-muted-foreground">렌터카</p>
          <p className="font-heading text-lg font-bold">{rental.bookingRef ?? "렌터카"}</p>
          <p className="text-xs text-muted-foreground">
            {rental.departureFrom} → {rental.arrivalTo}
          </p>
        </article>
      ) : null}

      <article className="flex items-center justify-between rounded-[1.75rem] bg-card px-4 py-3 shadow-sm ring-1 ring-border">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            {weather?.emoji ?? "⛅"}
          </span>
          <div>
            <p className="font-heading text-2xl font-bold">{weather?.temperature ?? 22}°</p>
            <p className="text-xs text-muted-foreground">{weather?.label ?? "구름 조금"}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground">
            {Number(today.slice(5, 7))}월 {Number(today.slice(8, 10))}일 (오늘) · 제주
          </p>
          <p className="text-sm font-bold">
            최저 / 최고 {weather?.low ?? 16}° / {weather?.high ?? 24}°
          </p>
        </div>
      </article>
    </section>
  );
}
