"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function toIso(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
}: {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}) {
  const initial = startDate ? new Date(`${startDate}T00:00:00`) : new Date();
  const [cursor, setCursor] = useState({ year: initial.getFullYear(), month: initial.getMonth() });

  const cells = useMemo(() => {
    const first = startOfMonth(cursor.year, cursor.month);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const slots: Array<{ iso: string; day: number; inMonth: boolean } | null> = [];
    for (let i = 0; i < startWeekday; i += 1) slots.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      slots.push({ iso: toIso(cursor.year, cursor.month, d), day: d, inMonth: true });
    }
    return slots;
  }, [cursor]);

  function pick(iso: string) {
    if (!startDate || (startDate && endDate)) {
      onChange(iso, iso);
      return;
    }
    if (iso < startDate) {
      onChange(iso, startDate);
      return;
    }
    onChange(startDate, iso);
  }

  const label = `${cursor.year}년 ${cursor.month + 1}월`;

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-2 flex items-center justify-between">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          aria-label="이전 달"
          onClick={() =>
            setCursor((c) =>
              c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 },
            )
          }
        >
          ‹
        </Button>
        <p className="text-sm font-medium">{label}</p>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          aria-label="다음 달"
          onClick={() =>
            setCursor((c) =>
              c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 },
            )
          }
        >
          ›
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1" role="grid" aria-label="날짜 범위 선택">
        {cells.map((cell, i) => {
          if (!cell) return <span key={`e-${i}`} />;
          const selected =
            startDate && endDate && cell.iso >= startDate && cell.iso <= endDate;
          const edge = cell.iso === startDate || cell.iso === endDate;
          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => pick(cell.iso)}
              className={cn(
                "h-9 rounded-md text-sm",
                selected && "bg-accent text-accent-foreground",
                edge && "bg-primary text-primary-foreground",
              )}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
