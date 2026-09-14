import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Pulse({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[14px] bg-[#F0EDE8]", className)} />;
}

function PageChrome({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-white pt-[calc(20px+env(safe-area-inset-top,0px))]">
      {children}
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <PageChrome>
      <div className="flex items-start justify-between gap-3 px-5 pb-5">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Pulse className="h-7 w-[220px]" />
          <Pulse className="h-4 w-[140px]" />
        </div>
        <Pulse className="h-10 w-16 rounded-[12px]" />
      </div>
      <div className="flex flex-col gap-3 px-5 pt-2">
        <Pulse className="h-[210px] rounded-[20px]" />
        <Pulse className="h-[180px] rounded-[20px]" />
        <Pulse className="h-[96px] rounded-[20px]" />
      </div>
    </PageChrome>
  );
}

export function ListPageSkeleton() {
  return (
    <PageChrome>
      <div className="px-[22px] pb-5">
        <Pulse className="h-7 w-[200px]" />
      </div>
      <div className="flex flex-col gap-3 px-5 pt-1">
        <Pulse className="h-10 w-full rounded-[20px]" />
        <div className="flex gap-2">
          <Pulse className="h-7 w-14 rounded-full" />
          <Pulse className="h-7 w-14 rounded-full" />
          <Pulse className="h-7 w-16 rounded-full" />
        </div>
        <Pulse className="h-[88px] rounded-[20px]" />
        <Pulse className="h-[88px] rounded-[20px]" />
        <Pulse className="h-[88px] rounded-[20px]" />
      </div>
    </PageChrome>
  );
}

export function PlannerPageSkeleton() {
  return (
    <PageChrome>
      <div className="px-[22px] pb-5">
        <Pulse className="h-7 w-[180px]" />
      </div>
      <div className="flex flex-col gap-3 px-5 pt-1">
        <div className="flex gap-2">
          <Pulse className="h-7 w-16 rounded-full" />
          <Pulse className="h-7 w-16 rounded-full" />
          <Pulse className="h-7 w-16 rounded-full" />
        </div>
        <Pulse className="h-[180px] rounded-[20px]" />
        <Pulse className="h-[92px] rounded-[20px]" />
        <Pulse className="h-[92px] rounded-[20px]" />
      </div>
    </PageChrome>
  );
}

export function BudgetPageSkeleton() {
  return (
    <PageChrome>
      <div className="px-[22px] pb-5">
        <Pulse className="h-7 w-[160px]" />
      </div>
      <div className="flex flex-col gap-3 px-5 pt-1">
        <Pulse className="h-[180px] rounded-[20px]" />
        <Pulse className="h-[120px] rounded-[20px]" />
        <Pulse className="h-[72px] rounded-[20px]" />
        <Pulse className="h-[72px] rounded-[20px]" />
      </div>
    </PageChrome>
  );
}

export function PrepPageSkeleton() {
  return (
    <PageChrome>
      <div className="px-[22px] pb-5">
        <Pulse className="h-7 w-[240px]" />
      </div>
      <PrepBodySkeleton className="px-5 pt-1" />
    </PageChrome>
  );
}

export function PrepBodySkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-full flex-col gap-3", className)} aria-busy="true" aria-label="불러오는 중">
      <Pulse className="h-10 w-full rounded-[14px]" />
      <Pulse className="h-2 w-full rounded-full" />
      <Pulse className="h-[72px] rounded-[20px]" />
      <Pulse className="h-[72px] rounded-[20px]" />
    </div>
  );
}

export function CapsuleSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4 py-6" aria-busy="true" aria-label="불러오는 중">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Pulse className="size-12 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Pulse className="h-3 w-24" />
            <Pulse className="h-4 w-full" />
            <Pulse className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WeatherCardSkeleton() {
  return (
    <article className="flex min-h-[96px] w-full items-center rounded-[20px] bg-white px-[18px] py-3.5 shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex w-full items-center gap-3.5">
        <Pulse className="size-[58px] rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Pulse className="h-3 w-28" />
          <Pulse className="h-6 w-24" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Pulse className="h-3 w-12" />
          <Pulse className="h-5 w-16" />
        </div>
      </div>
    </article>
  );
}
