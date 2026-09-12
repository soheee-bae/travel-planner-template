"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { CATEGORY_COLORS } from "@/features/expenses/category-colors";
import type { CategoryShare } from "@/lib/expense-aggregation";

function formatMan(amount: number): string {
  if (amount >= 10000) return `${Math.round(amount / 10000)}만`;
  return `${amount.toLocaleString()}`;
}

export function BudgetDonutChart({ data, total }: { data: CategoryShare[]; total?: number }) {
  const man = total != null ? `${Math.round(total / 10000)}만원` : null;
  return (
    <div className="flex h-[140px] w-full items-center gap-4">
      <div className="relative size-[140px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              innerRadius={52}
              outerRadius={70}
              stroke="transparent"
              strokeWidth={0}
              paddingAngle={1}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {man ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[11px] leading-[13px] font-normal text-[#8C8885]">추억 값</p>
            <p className="font-nunito text-[13px] leading-[18px] font-bold text-[#4A4543]">{man}</p>
          </div>
        ) : null}
      </div>
      <ul
        className="flex h-[138px] flex-1 flex-col items-start gap-[5px] pb-[5px]"
        aria-label="카테고리별 비율"
      >
        {data.map((entry) => (
          <li key={entry.category} className="flex h-[18px] w-full items-center gap-1.5">
            <span
              className="size-2.5 shrink-0 rounded-[3px]"
              style={{
                backgroundColor: CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS],
              }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 text-xs leading-[18px] font-normal text-[#8C8885]">
              {entry.category}
            </span>
            <span className="font-nunito text-xs leading-[18px] font-bold text-[#4A4543]">
              {formatMan(entry.total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
