"use client";

import { useRef, useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import { airportCodeFromName, cityLabelFromName } from "@/lib/airport";
import { formatDday, formatDdayCaption, formatDuration } from "@/lib/date";
import { useJejuWeather } from "@/features/overview/hooks/use-jeju-weather";
import { IllustrationIcon } from "@/components/ui/illustration-icon";
import { ILLUSTRATION } from "@/lib/illustrations";
import { WeatherCardSkeleton } from "@/components/ui/page-skeleton";
import { TicketPerforation, applyTitleScrollShadow } from "@/components/ui/figma";
import { SegmentedSwap } from "@/components/ui/segmented-swap";
import { useReducedMotion } from "@/hooks/use-motion-safe";
import { cn } from "@/lib/utils";
import type { Accommodation, Transport } from "@/mocks/fixtures/overview";
import type { Trip } from "@/mocks/fixtures/trips";

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
  const { data: weather, isPending: weatherPending, isError: weatherError } = useJejuWeather();
  const [flightIdx, setFlightIdx] = useState(0);
  const [stayIdx, setStayIdx] = useState(0);
  const prevFlightRef = useRef(0);
  const flightDirRef = useRef(1);
  const prevStayRef = useRef(0);
  const stayDirRef = useRef(1);
  const reduce = useReducedMotion();
  const indicatorTransition = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 36 };
  if (flightIdx !== prevFlightRef.current) {
    flightDirRef.current = flightIdx > prevFlightRef.current ? 1 : -1;
    prevFlightRef.current = flightIdx;
  }
  if (stayIdx !== prevStayRef.current) {
    stayDirRef.current = stayIdx > prevStayRef.current ? 1 : -1;
    prevStayRef.current = stayIdx;
  }
  const sortedFlights = [...flights].sort((a, b) => a.departureAt.localeCompare(b.departureAt));
  const sortedStays = [...stays].sort((a, b) => a.checkinDate.localeCompare(b.checkinDate));
  const activeFlight = sortedFlights[flightIdx] ?? sortedFlights[0];
  const activeStay = sortedStays[stayIdx] ?? sortedStays[0];
  const weatherDate = weather?.date;

  return (
    <section className="flex h-full min-h-0 w-full flex-col">
      <header className="relative z-10 flex w-full shrink-0 items-center bg-white px-5 pt-[calc(12px+env(safe-area-inset-top,0px))] pb-3 transition-shadow duration-200 data-[scrolled]:shadow-[0_4px_10px_rgba(0,0,0,0.04)]">
        <div className="flex min-w-0 flex-col items-start">
          <h1 className="flex w-full items-center font-nunito text-[20px] leading-[30px] font-bold text-[#1A1A1A]">
            <span className="min-w-0 truncate">{trip.title}</span>
          </h1>
        </div>
      </header>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        onScroll={(event) => applyTitleScrollShadow(event.currentTarget)}
      >
      <div className="flex w-full flex-col items-start gap-3 px-5 pb-[50px]">
        <div
          className={cn(
            "relative isolate mt-3 flex min-h-[88px] w-full items-center overflow-visible rounded-[20px] bg-[#FF893B] px-6 py-4",
            "shadow-[0px_2px_12px_rgba(0,0,0,0.06),0px_6px_16px_rgba(255,137,59,0.28)]",
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-1 pr-4">
            <p className="w-full text-xs leading-[18px] tracking-[0.3px] text-[#FFFFFA]">
              {formatDdayCaption(trip.startDate, trip.endDate)}
            </p>
            <p className="w-full text-xs leading-[18px] text-[rgba(255,255,255,0.8)]">
              {formatMd(trip.startDate)}-{formatMd(trip.endDate)} {formatDuration(trip.startDate, trip.endDate)}
            </p>
          </div>
          <p className="shrink-0 font-nunito text-[38px] leading-none font-bold tracking-[-1px] text-[#FFFFFA]">
            {formatDday(trip.startDate, trip.endDate)}
          </p>
        </div>

        {activeFlight ? (
          <article className="flex w-full flex-col items-start overflow-hidden rounded-[20px] bg-white shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
            <LayoutGroup id="home-flight-tabs">
            <div className="box-border flex h-[45px] w-full items-start justify-center border-b border-[#EEEEEE] p-0">
              {(sortedFlights.length > 0 ? sortedFlights : [activeFlight]).map((flight, index) => (
                <button
                  key={flight.id}
                  type="button"
                  onClick={() => setFlightIdx(index)}
                  className={cn(
                    "relative box-border flex h-[45px] flex-1 flex-col items-center justify-center px-0 py-4 text-[13px] leading-5",
                    index === flightIdx ? "font-bold text-[#FF9F43]" : "font-medium text-[#5D5D5D]",
                  )}
                >
                  {index === 0 ? "출발편" : "귀국편"}
                  {index === flightIdx ? (
                    <motion.span
                      layoutId="home-flight-underline"
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF9F43]"
                      transition={indicatorTransition}
                      aria-hidden
                    />
                  ) : null}
                </button>
              ))}
            </div>
            </LayoutGroup>

            <SegmentedSwap activeKey={activeFlight.id} direction={flightDirRef.current} durationKey="micro">
              <FlightTicketBody flight={activeFlight} />
            </SegmentedSwap>
          </article>
        ) : null}

        {activeStay ? (
          <article className="relative isolate flex w-full flex-col items-start overflow-hidden rounded-[20px] bg-white shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
            <LayoutGroup id="home-stay-tabs">
            <div className="box-border flex h-[45px] w-full items-start justify-center border-b border-[#EEEEEE] p-0">
              {sortedStays.map((stay, index) => (
                <button
                  key={stay.id}
                  type="button"
                  onClick={() => setStayIdx(index)}
                  className={cn(
                    "relative box-border flex h-[45px] flex-1 flex-col items-center justify-center px-0 py-4 text-[13px] leading-5",
                    index === stayIdx ? "font-bold text-[#FF9F43]" : "font-medium text-[#5D5D5D]",
                  )}
                >
                  Day {index + 1}박 숙소
                  {index === stayIdx ? (
                    <motion.span
                      layoutId="home-stay-underline"
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF9F43]"
                      transition={indicatorTransition}
                      aria-hidden
                    />
                  ) : null}
                </button>
              ))}
            </div>
            </LayoutGroup>
            <SegmentedSwap activeKey={activeStay.id} direction={stayDirRef.current} durationKey="micro">
              <StayTicketBody stay={activeStay} />
            </SegmentedSwap>
          </article>
        ) : null}

        {weatherPending ? (
          <WeatherCardSkeleton />
        ) : weatherError || !weather || !weatherDate ? (
          <article className="flex min-h-[96px] w-full items-center justify-center rounded-[20px] bg-white px-[18px] py-3.5 shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
            <p className="text-[13px] leading-5 text-[#8E8E8E]">오늘 날씨를 못 가져왔어</p>
          </article>
        ) : (
          <article className="relative flex min-h-[96px] w-full items-center rounded-[20px] bg-white px-[18px] py-3.5 shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
            <div className="flex w-full min-w-0 items-center gap-3.5">
              <span className="flex size-[58px] shrink-0 items-center justify-center" aria-hidden>
                <IllustrationIcon src={weather.icon} className="size-[58px]" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                <p className="flex h-[17px] w-full items-center font-nunito text-[11px] leading-4 font-normal text-[#8E8E8E]">
                  {Number(weatherDate.slice(5, 7))}월 {Number(weatherDate.slice(8, 10))}일 (오늘) · 제주
                </p>
                <p className="flex h-[30px] w-full min-w-0 items-baseline gap-1.5">
                  <span className="shrink-0 font-nunito text-[20px] leading-[30px] font-extrabold text-[#4A4543]">
                    {weather.temperature}°
                  </span>
                  <span className="min-w-0 truncate text-[14px] leading-[21px] font-bold text-black">
                    {weather.label}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <p className="whitespace-nowrap text-right text-[10px] leading-[15px] text-[#8E8E8E]">
                  최저 / 최고
                </p>
                <p className="whitespace-nowrap text-right text-[14px] leading-[21px] font-bold text-[#1A1A1A]">
                  {weather.low}° / {weather.high}°
                </p>
              </div>
            </div>
          </article>
        )}
      </div>
      </div>
    </section>
  );
}

function FlightTicketBody({ flight }: { flight: Transport }) {
  return (
    <>
      <div className="flex h-[85px] w-full items-center justify-between px-[22px] py-4">
        <div className="flex h-[53px] w-[51px] shrink-0 flex-col items-start gap-[3px]">
          <p className="flex h-[33px] w-full items-center font-nunito text-[22px] leading-[33px] font-extrabold text-black">
            {airportCode(flight, "from")}
          </p>
          <p className="flex h-[17px] items-center text-[11px] leading-4 font-normal text-[#8E8E8E]">
            {cityLabel(flight.departureFrom)}
          </p>
        </div>
        <div className="flex h-[19px] min-w-0 flex-1 flex-col items-start px-2">
          <div className="flex h-[19px] w-full flex-col items-center gap-[3px]">
            <p className="flex h-[15px] items-center text-[10px] leading-[15px] text-[#8E8E8E]">
              {flightDuration(flight.departureAt, flight.arrivalAt)}
            </p>
            <span className="h-px w-full self-stretch bg-[#FF9F43]" aria-hidden />
          </div>
        </div>
        <div className="flex h-[53px] w-10 shrink-0 flex-col items-end gap-[3px]">
          <p className="flex h-[33px] w-full items-center justify-end font-nunito text-[22px] leading-[33px] font-extrabold text-black">
            {airportCode(flight, "to")}
          </p>
          <p className="flex h-[17px] w-full items-center justify-end text-[11px] leading-4 font-normal text-[#8E8E8E]">
            {cityLabel(flight.arrivalTo)}
          </p>
        </div>
      </div>

      <TicketPerforation />

      <div className="flex h-[70px] w-full items-start justify-between gap-[44.3px] px-[22px] py-4">
        <div className="flex h-[38px] flex-col items-start gap-[3px]">
          <p className="flex h-[15px] items-center text-[10px] leading-[15px] text-[#8E8E8E]">날짜</p>
          <p className="flex h-5 items-center font-nunito text-[13px] leading-5 font-bold whitespace-nowrap text-[#4A4543]">
            {flight.departureAt.slice(0, 10).replaceAll("-", ".")}
          </p>
        </div>
        <div className="flex h-[38px] flex-col items-start gap-[3px]">
          <p className="flex h-[15px] items-center text-[10px] leading-[15px] text-[#8E8E8E]">출발</p>
          <p className="flex h-[18px] items-center text-xs leading-[18px] font-bold whitespace-nowrap text-[#1A1A1A]">
            {timeOf(flight.departureAt)}
          </p>
        </div>
        <div className="flex h-[38px] flex-col items-start gap-[3px]">
          <p className="flex h-[15px] items-center text-[10px] leading-[15px] text-[#8E8E8E]">도착</p>
          <p className="flex h-[18px] items-center text-xs leading-[18px] font-bold whitespace-nowrap text-[#1A1A1A]">
            {timeOf(flight.arrivalAt)}
          </p>
        </div>
        <div className="flex h-[38px] flex-col items-start gap-[3px]">
          <p className="flex h-[15px] items-center text-[10px] leading-[15px] text-[#8E8E8E]">항공사</p>
          <p className="flex h-[18px] items-center text-xs leading-[18px] font-bold whitespace-nowrap text-[#1A1A1A]">
            {flight.bookingRef ?? ""}
          </p>
        </div>
      </div>

      <TicketPerforation />

      <div className="flex h-16 w-full items-center justify-between gap-[100.6px] rounded-b-[20px] bg-white px-[22px] py-4">
        {flight.memo ? (
          <p className="flex h-[17px] min-w-0 items-center truncate text-[11px] leading-4 font-bold tracking-[0.66px] text-[#FF9F43]">
            {flight.memo}
          </p>
        ) : (
          <span />
        )}
        {flight.type === "비행기" ? (
          <div className="flex shrink-0 items-start gap-3">
            <div className="flex h-8 flex-col items-center gap-px">
              <p className="flex h-[14px] items-center text-center text-[9px] leading-[14px] text-[#8E8E8E]">좌석1</p>
              <p className="flex h-[17px] items-center text-center text-[11px] leading-4 font-bold text-[#FF9F43]">
                {flight.seat1 ?? ""}
              </p>
            </div>
            <div className="flex h-8 flex-col items-center gap-px">
              <p className="flex h-[14px] items-center text-center text-[9px] leading-[14px] text-[#8E8E8E]">좌석2</p>
              <p className="flex h-[17px] items-center text-center text-[11px] leading-4 font-bold text-[#FF9F43]">
                {flight.seat2 ?? ""}
              </p>
            </div>
          </div>
        ) : (
          <span />
        )}
      </div>
    </>
  );
}

function StayTicketBody({ stay }: { stay: Accommodation }) {
  return (
    <>
      <div className="flex h-[76px] w-full items-center gap-3 px-[22px] py-4">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#FFD6BB] p-1.5"
          aria-hidden
        >
          <IllustrationIcon src={ILLUSTRATION.hotel} className="size-full" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <p className="flex h-[23px] w-full items-center truncate text-[15px] leading-[22px] font-bold text-[#1A1A1A]">
            {stay.name}
          </p>
          <p className="flex h-[18px] w-full min-w-0 items-center truncate text-xs leading-[18px] font-normal text-black">
            {stay.address ?? ""}
          </p>
        </div>
      </div>
      <TicketPerforation />
      <div className="flex h-[70px] w-full items-start px-[22px] py-4">
        <div className="flex h-[38px] min-w-0 flex-1 flex-col items-start gap-[3px]">
          <p className="flex h-[15px] w-full items-center text-[10px] leading-[15px] text-[#8E8E8E]">체크인</p>
          <p className="flex h-5 w-full items-center font-nunito text-[13px] leading-5 font-bold text-[#4A4543]">
            {formatMd(stay.checkinDate)} {stay.checkinTime}
          </p>
        </div>
        <div className="flex h-[38px] min-w-0 flex-1 flex-col items-start gap-[3px]">
          <p className="flex h-[15px] w-full items-center text-[10px] leading-[15px] text-[#8E8E8E]">체크아웃</p>
          <p className="flex h-5 w-full items-center font-nunito text-[13px] leading-5 font-bold text-[#4A4543]">
            {formatMd(stay.checkoutDate)} {stay.checkoutTime}
          </p>
        </div>
      </div>
    </>
  );
}
