import type { Accommodation, Transport } from "@/mocks/fixtures/overview";
import type { Place } from "@/mocks/fixtures/places";
import type { Expense } from "@/mocks/fixtures/expenses";
import { sumAmount } from "@/lib/expense-aggregation";

export function SummaryStats({
  accommodations,
  transports,
  places,
  expenses,
}: {
  accommodations: Accommodation[];
  transports: Transport[];
  places: Place[];
  expenses: Expense[];
}) {
  const lodgingAndTransit =
    accommodations.reduce((sum, a) => sum + (a.cost ?? 0), 0) +
    transports.reduce((sum, t) => sum + (t.cost ?? 0), 0);
  const unassigned = places.filter((p) => p.dayIndex === null).length;
  const byCategory = places.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
  const estimatedPlaces = places.reduce((sum, p) => sum + (p.estimatedCost ?? 0), 0);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-medium text-foreground">📊 요약</p>
      <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
        <li>
          장소 {places.length}곳 · 미배정 {unassigned}곳
        </li>
        <li>
          {Object.entries(byCategory)
            .map(([k, v]) => `${k} ${v}`)
            .join(" · ") || "카테고리 없음"}
        </li>
        <li>
          숙소·교통:{" "}
          <span className="font-semibold text-money">{lodgingAndTransit.toLocaleString()}</span>
        </li>
        <li>
          장소 예상:{" "}
          <span className="font-semibold text-money">{estimatedPlaces.toLocaleString()}</span>
        </li>
        <li>
          비용 합계:{" "}
          <span className="font-semibold text-money">{sumAmount(expenses).toLocaleString()}</span>
        </li>
      </ul>
    </div>
  );
}
