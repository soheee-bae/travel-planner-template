"use client";

import { useState } from "react";
import { formatDday, formatDuration } from "@/lib/date";
import { useJejuWeather } from "@/features/overview/hooks/use-jeju-weather";
import { cn } from "@/lib/utils";
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

function cityLabel(name: string): string {
  if (name.includes("김포") || name.includes("서울")) return "김포";
  if (name.includes("제주")) return "제주";
  return name;
}

export function JejuHomeHero({
  trip,
  flights,
  stays,
}: {
  trip: Trip;
  flights: Transport[];
  stays: Accommodation[];
}) {
  const { data: weather } = useJejuWeather();
  const [flightIdx, setFlightIdx] = useState(0);
  const [stayIdx, setStayIdx] = useState(0);
  const outbound = flights[0];
  const inbound = flights[1];
  const activeFlight = flights[flightIdx] ?? outbound;
  const activeStay = stays[stayIdx] ?? stays[0];

  return (
    <section className="flex flex-col gap-4 pb-20">
      <header className="flex h-11 items-center">
        <div className="min-w-0">
          <h1 className="font-heading text-[17px] leading-tight font-bold text-[#1A1A1A]">{trip.title}</h1>
          <p className="text-xs text-[#8E8E8E]">
            {formatMd(trip.startDate)} - {formatMd(trip.endDate)} · {formatDuration(trip.startDate, trip.endDate)}{" "}
            {trip.coverEmoji}
          </p>
        </div>
      </header>

      <div className="rounded-3xl bg-[#FF893B] px-6 pt-3.5 pb-3 text-[#FFFFFA] shadow-[0_3px_12px_rgba(0,0,0,0.25)]">
        <p className="text-xs tracking-[0.3px]">출발까지</p>
        <p className="font-heading text-[38px] leading-none font-bold tracking-tight">
          {formatDday(trip.startDate, trip.endDate)}
        </p>
        <p className="mt-1 text-[10px] text-white/80">
          {trip.startDate.slice(0, 4)}년 {Number(trip.startDate.slice(5, 7))}월{" "}
          {Number(trip.startDate.slice(8, 10))}일 ({weekdayKo(trip.startDate)})
        </p>
      </div>

      {activeFlight ? (
        <article className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="flex border-b border-[#EEE]">
            {flights.map((flight, index) => (
              <button
                key={flight.id}
                type="button"
                onClick={() => setFlightIdx(index)}
                className={cn(
                  "flex-1 py-3 text-center text-[13px]",
                  index === flightIdx
                    ? "border-b-2 border-[#FF9F43] font-bold text-[#FF9F43]"
                    : "font-medium text-[#5D5D5D]",
                )}
              >
                {index === 0 ? "출발편" : "귀국편"}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between px-5 pt-4">
            <div>
              <p className="font-heading text-[22px] font-extrabold text-black">
                {airportCode(activeFlight.departureFrom)}
              </p>
              <p className="text-[11px] text-[#8E8E8E]">{cityLabel(activeFlight.departureFrom)}</p>
            </div>
            <div className="flex flex-1 flex-col items-center px-3">
              <p className="text-[10px] text-[#8E8E8E]">
                {flightDuration(activeFlight.departureAt, activeFlight.arrivalAt)}
              </p>
              <span className="mt-1 h-px w-full bg-[#FF9F43]" aria-hidden />
            </div>
            <div className="text-right">
              <p className="font-heading text-[22px] font-extrabold text-black">
                {airportCode(activeFlight.arrivalTo)}
              </p>
              <p className="text-[11px] text-[#8E8E8E]">{cityLabel(activeFlight.arrivalTo)}</p>
            </div>
          </div>
          <div className="mx-5 my-3 border-t border-dashed border-[#DDD]" />
          <div className="grid grid-cols-4 gap-2 px-5 pb-3">
            <div>
              <p className="text-[10px] text-[#8E8E8E]">날짜</p>
              <p className="text-[13px] font-bold text-[#4A4543]">
                {activeFlight.departureAt.slice(0, 10).replaceAll("-", ".")}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#8E8E8E]">출발</p>
              <p className="text-xs font-bold text-[#1A1A1A]">{timeOf(activeFlight.departureAt)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#8E8E8E]">도착</p>
              <p className="text-xs font-bold text-[#1A1A1A]">{timeOf(activeFlight.arrivalAt)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#8E8E8E]">항공사</p>
              <p className="text-xs font-bold text-[#1A1A1A]">{activeFlight.bookingRef ?? "제주항공"}</p>
            </div>
          </div>
          {activeFlight.memo ? (
            <>
              <div className="mx-5 border-t border-dashed border-[#DDD]" />
              <div className="flex items-center justify-between px-5 pt-2 pb-3">
                <p className="text-[11px] font-bold tracking-wide text-[#FF9F43]">{activeFlight.memo}</p>
              </div>
            </>
          ) : null}
          {inbound && outbound ? <span className="sr-only">{inbound.departureFrom}</span> : null}
        </article>
      ) : null}

      {activeStay ? (
        <article className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="flex border-b border-[#EEE]">
            {stays.map((stay, index) => (
              <button
                key={stay.id}
                type="button"
                onClick={() => setStayIdx(index)}
                className={cn(
                  "flex-1 py-3 text-center text-[13px]",
                  index === stayIdx
                    ? "border-b-2 border-[#FF9F43] font-bold text-[#FF9F43]"
                    : "font-medium text-[#5D5D5D]",
                )}
              >
                Day {index + 1}박 숙소
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 px-5 pt-4">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#FFD6BB] text-xl"
              aria-hidden
            >
              🏨
            </span>
            <div>
              <p className="text-[15px] font-bold text-[#1A1A1A]">{activeStay.name}</p>
              <p className="text-xs text-black">{activeStay.memo ?? activeStay.address}</p>
            </div>
          </div>
          <div className="mx-5 my-3 border-t border-dashed border-[#DDD]" />
          <div className="grid grid-cols-2 gap-2 px-5 pb-4">
            <div>
              <p className="text-[10px] text-[#8E8E8E]">체크인</p>
              <p className="text-[13px] font-bold text-[#4A4543]">
                {formatMd(activeStay.checkinDate)} {activeStay.checkinTime}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#8E8E8E]">체크아웃</p>
              <p className="text-[13px] font-bold text-[#4A4543]">
                {formatMd(activeStay.checkoutDate)} {activeStay.checkoutTime}
              </p>
            </div>
          </div>
        </article>
      ) : null}

      <article className="flex items-center gap-3.5 rounded-[20px] bg-white px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <span className="text-[38px] leading-none" aria-hidden>
          {weather?.emoji ?? "⛅"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-[#8E8E8E]">
            {Number(trip.startDate.slice(5, 7))}월 {Number(trip.startDate.slice(8, 10))}일 (출발일) · 제주
          </p>
          <p className="flex items-baseline gap-1.5">
            <span className="font-heading text-xl font-extrabold text-[#4A4543]">
              {weather?.temperature ?? 22}°
            </span>
            <span className="text-sm font-bold text-black">{weather?.label ?? "구름 조금"}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[#8E8E8E]">최저 / 최고</p>
          <p className="text-sm font-bold text-[#1A1A1A]">
            {weather?.low ?? 16}° / {weather?.high ?? 24}°
          </p>
        </div>
      </article>
    </section>
  );
}
