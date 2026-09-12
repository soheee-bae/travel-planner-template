"use client";

import { FigmaChip, FigmaChipRow } from "@/components/ui/figma";
import { getTripDays } from "@/lib/trip-days";

export function PlannerDayTabs({
  startDate,
  endDate,
  active,
  onChange,
}: {
  startDate: string;
  endDate: string;
  active: number;
  onChange: (day: number) => void;
}) {
  const days = getTripDays(startDate, endDate);

  return (
    <FigmaChipRow role="tablist" aria-label="일차 선택">
      {days.map((day) => (
        <FigmaChip
          key={day.dayIndex}
          role="tab"
          aria-selected={active === day.dayIndex}
          active={active === day.dayIndex}
          onClick={() => onChange(day.dayIndex)}
        >
          Day {day.dayIndex}
        </FigmaChip>
      ))}
    </FigmaChipRow>
  );
}
