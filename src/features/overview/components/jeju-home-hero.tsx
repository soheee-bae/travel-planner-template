"use client";

import { useState } from "react";
import { airportCodeFromName, cityLabelFromName } from "@/lib/airport";
import { formatDday, formatDdayCaption, formatDuration, todayIsoSeoul } from "@/lib/date";
import { useJejuWeather } from "@/features/overview/hooks/use-jeju-weather";
import { TicketPerforation } from "@/components/ui/figma";
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

function airportCode(flight: Transport, side: "from" | "to"): string {
  if (side === "from") return flight.departureCode?.trim() || airportCodeFromName(flight.departureFrom);
  return flight.arrivalCode?.trim() || airportCodeFromName(flight.arrivalTo);
}

function cityLabel(name: string): string {
  return cityLabelFromName(name);
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
  const sortedFlights = [...flights].sort((a, b) => a.departureAt.localeCompare(b.departureAt));
  const sortedStays = [...stays].sort((a, b) => a.checkinDate.localeCompare(b.checkinDate));
  const outbound = sortedFlights[0];
  const inbound = sortedFlights[1];
  const activeFlight = sortedFlights[flightIdx] ?? outbound;
  const activeStay = sortedStays[stayIdx] ?? sortedStays[0];
  const weatherDate = weather?.date ?? todayIsoSeoul();

  return (
    <section className="flex w-full flex-col pb-12">
      <header className="flex min-h-11 w-full items-center px-5">
        <div className="flex min-w-0 flex-col items-start">
          <h1 className="flex w-full items-center font-nunito text-[20px] leading-[30px] font-bold text-[#1A1A1A]">
            {trip.title}
          </h1>
          <p className="flex h-[18px] w-full items-center text-xs leading-[18px] font-normal text-[#8E8E8E]">
            {formatMd(trip.startDate)} - {formatMd(trip.endDate)} · {formatDuration(trip.startDate, trip.endDate)}
          </p>
        </div>
      </header>

      <div className="flex w-full flex-col items-start gap-3 px-5 pt-4 pb-5">
        <div
          className={cn(
            "relative isolate flex h-[106px] w-full flex-col items-start overflow-visible rounded-[20px] bg-[#FF893B] px-6 pt-3.5 pb-0",
            "shadow-[0px_2px_12px_rgba(0,0,0,0.06),0px_6px_16px_rgba(255,137,59,0.28)]",
          )}
        >
          <p className="flex h-[18px] w-full items-center text-xs leading-[18px] tracking-[0.3px] text-[#FFFFFA]">
            {formatDdayCaption(trip.startDate, trip.endDate)}
          </p>
          <p className="flex h-11 w-full items-center font-nunito text-[38px] leading-11 font-bold tracking-[-1px] text-[#FFFFFA]">
            {formatDday(trip.startDate, trip.endDate)}
          </p>
          <p className="flex h-[22px] w-full items-center text-[10px] leading-[18px] text-[rgba(255,255,255,0.8)]">
            {trip.startDate.slice(0, 4)}년 {Number(trip.startDate.slice(5, 7))}월{" "}
            {Number(trip.startDate.slice(8, 10))}일 ({weekdayKo(trip.startDate)})
          </p>
        </div>

        {activeFlight ? (
          <article className="flex w-full flex-col items-start overflow-hidden rounded-[20px] bg-white shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
            <div className="box-border flex h-[49px] w-full items-start justify-center border-b border-[#EEEEEE] p-0">
              {(sortedFlights.length > 0 ? sortedFlights : [activeFlight]).map((flight, index) => (
                <button
                  key={flight.id}
                  type="button"
                  onClick={() => setFlightIdx(index)}
                  className={cn(
                    "box-border flex h-12 flex-1 flex-col items-center justify-center px-0 py-[13px] text-[13px] leading-5",
                    index === flightIdx
                      ? "border-b-2 border-[#FF9F43] font-bold text-[#FF9F43]"
                      : "font-medium text-[#5D5D5D]",
                  )}
                >
                  {index === 0 ? "출발편" : "귀국편"}
                </button>
              ))}
            </div>

            <div className="flex h-[71px] w-full items-center justify-between px-[22px] pt-[18px] pb-0">
              <div className="flex h-[53px] w-[51px] flex-col items-start gap-[3px]">
                <p className="flex h-[33px] w-full items-center font-nunito text-[22px] leading-[33px] font-extrabold text-black">
                  {airportCode(activeFlight, "from")}
                </p>
                <p className="flex h-[17px] items-center text-[11px] leading-4 font-normal text-[#8E8E8E]">
                  {cityLabel(activeFlight.departureFrom)}
                </p>
              </div>
              <div className="flex h-[19px] min-w-0 flex-1 flex-col items-start px-2">
                <div className="flex h-[19px] w-full flex-col items-center gap-[3px]">
                  <p className="flex h-[15px] items-center text-[10px] leading-[15px] text-[#8E8E8E]">
                    {flightDuration(activeFlight.departureAt, activeFlight.arrivalAt)}
                  </p>
                  <span className="h-px w-full bg-[#FF9F43]" aria-hidden />
                </div>
              </div>
              <div className="flex h-[53px] w-10 flex-col items-start gap-[3px]">
                <p className="flex h-[33px] w-full items-center justify-end font-nunito text-[22px] leading-[33px] font-extrabold text-black">
                  {airportCode(activeFlight, "to")}
                </p>
                <p className="flex h-[17px] w-full items-center justify-end text-[11px] leading-4 font-normal text-[#8E8E8E]">
                  {cityLabel(activeFlight.arrivalTo)}
                </p>
              </div>
            </div>

            <TicketPerforation />

            <div className="flex w-full items-start justify-between px-[22px] pt-3.5 pb-[18px]">
              <div className="flex flex-col items-start gap-[3px]">
                <p className="text-[10px] leading-[15px] text-[#8E8E8E]">날짜</p>
                <p className="font-nunito text-[13px] leading-5 font-bold whitespace-nowrap text-[#4A4543]">
                  {activeFlight.departureAt.slice(0, 10).replaceAll("-", ".")}
                </p>
              </div>
              <div className="flex flex-col items-start gap-[3px]">
                <p className="text-[10px] leading-[15px] text-[#8E8E8E]">출발</p>
                <p className="text-xs leading-[18px] font-bold whitespace-nowrap text-[#1A1A1A]">
                  {timeOf(activeFlight.departureAt)}
                </p>
              </div>
              <div className="flex flex-col items-start gap-[3px]">
                <p className="text-[10px] leading-[15px] text-[#8E8E8E]">도착</p>
                <p className="text-xs leading-[18px] font-bold whitespace-nowrap text-[#1A1A1A]">
                  {timeOf(activeFlight.arrivalAt)}
                </p>
              </div>
              <div className="flex flex-col items-start gap-[3px]">
                <p className="text-[10px] leading-[15px] text-[#8E8E8E]">항공사</p>
                <p className="text-xs leading-[18px] font-bold whitespace-nowrap text-[#1A1A1A]">
                  {activeFlight.bookingRef ?? ""}
                </p>
              </div>
            </div>

            <TicketPerforation padded={false} />

            {activeFlight.memo || activeFlight.type === "비행기" ? (
              <div className="flex min-h-[52px] w-full items-center justify-between gap-4 rounded-b-[20px] bg-white px-[22px] pt-2 pb-3">
                {activeFlight.memo ? (
                  <p className="flex h-[17px] min-w-0 items-center text-[11px] leading-4 font-bold tracking-[0.66px] text-[#FF9F43]">
                    {activeFlight.memo}
                  </p>
                ) : (
                  <span />
                )}
                {activeFlight.type === "비행기" ? (
                  <div className="flex shrink-0 items-start gap-4">
                    <div className="flex flex-col items-start gap-[3px]">
                      <p className="flex h-[15px] items-center text-[10px] leading-[15px] text-[#8E8E8E]">좌석1</p>
                      <p className="flex h-[18px] items-center text-xs leading-[18px] font-bold text-[#FF9F43]">
                        {activeFlight.seat1 ?? ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-[3px]">
                      <p className="flex h-[15px] items-center text-[10px] leading-[15px] text-[#8E8E8E]">좌석2</p>
                      <p className="flex h-[18px] items-center text-xs leading-[18px] font-bold text-[#FF9F43]">
                        {activeFlight.seat2 ?? ""}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {inbound && outbound ? <span className="sr-only">{inbound.departureFrom}</span> : null}
          </article>
        ) : null}

        {activeStay ? (
          <article className="relative isolate flex w-full flex-col items-start overflow-hidden rounded-[20px] bg-white shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
            <div className="box-border flex h-[41px] w-full items-start justify-center border-b border-[#EEEEEE] px-0 pt-0 pb-px">
              {sortedStays.map((stay, index) => (
                <button
                  key={stay.id}
                  type="button"
                  onClick={() => setStayIdx(index)}
                  className={cn(
                    "box-border flex h-[41px] flex-1 flex-col items-center justify-center px-0 py-[13px] text-[13px] leading-5",
                    index === stayIdx
                      ? "-mx-0.5 border-b-2 border-[#FF9F43] font-bold text-[#FF9F43]"
                      : "font-medium text-[#5D5D5D]",
                  )}
                >
                  Day {index + 1}박 숙소
                </button>
              ))}
            </div>
            <div className="flex w-full items-center justify-start gap-3 px-[22px] pt-4 pb-0">
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#FFD6BB] text-xl"
                aria-hidden
              >
                {activeStay.icon ?? "🏨"}
              </span>
              <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                <p className="flex h-[23px] items-center text-[15px] leading-[22px] font-bold text-[#1A1A1A]">
                  {activeStay.name}
                </p>
                <p className="flex h-[18px] items-center text-xs leading-[18px] font-normal text-black">
                  {activeStay.memo ?? activeStay.address}
                </p>
              </div>
            </div>
            <TicketPerforation />
            <div className="flex w-full items-start justify-start gap-12 px-[22px] pt-px pb-[13px]">
              <div className="flex h-[38px] w-auto flex-col items-start gap-[3px]">
                <p className="flex h-[15px] items-center text-[10px] leading-[15px] text-[#8E8E8E]">체크인</p>
                <p className="flex h-5 items-center font-nunito text-[13px] leading-5 font-bold text-[#4A4543]">
                  {formatMd(activeStay.checkinDate)} {activeStay.checkinTime}
                </p>
              </div>
              <div className="flex h-[38px] w-auto flex-col items-start gap-[3px]">
                <p className="flex h-[15px] items-center text-[10px] leading-[15px] text-[#8E8E8E]">체크아웃</p>
                <p className="flex h-5 items-center font-nunito text-[13px] leading-5 font-bold text-[#4A4543]">
                  {formatMd(activeStay.checkoutDate)} {activeStay.checkoutTime}
                </p>
              </div>
            </div>
          </article>
        ) : null}

        <article className="relative flex h-[85px] w-full items-center rounded-[20px] bg-white px-[18px] py-3.5 shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
          <div className="flex h-[57px] w-full min-w-0 items-center gap-3.5">
            <span
              className="flex h-[57px] w-[38px] shrink-0 items-center font-nunito text-[38px] leading-[57px] font-normal text-black"
              aria-hidden
            >
              {weather?.emoji ?? "⛅"}
            </span>
            <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
              <p className="flex h-[17px] w-full items-center font-nunito text-[11px] leading-4 font-normal text-[#8E8E8E]">
                {Number(weatherDate.slice(5, 7))}월 {Number(weatherDate.slice(8, 10))}일 (오늘) · 제주
              </p>
              <p className="flex h-[30px] w-full min-w-0 items-baseline gap-1.5">
                <span className="shrink-0 font-nunito text-[20px] leading-[30px] font-extrabold text-[#4A4543]">
                  {weather?.temperature ?? 22}°
                </span>
                <span className="min-w-0 truncate text-[14px] leading-[21px] font-bold text-black">
                  {weather?.label ?? "구름 조금"}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <p className="whitespace-nowrap text-right text-[10px] leading-[15px] text-[#8E8E8E]">
                최저 / 최고
              </p>
              <p className="whitespace-nowrap text-right text-[14px] leading-[21px] font-bold text-[#1A1A1A]">
                {weather?.low ?? 16}° / {weather?.high ?? 24}°
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
