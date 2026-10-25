"use client";

import { useMemo, useState } from "react";
import {
  groupByCategory,
  sumAmount,
  summarizeReceiptSettlement,
  withoutGiftExpenses,
} from "@/lib/expense-aggregation";
import { useDeleteExpense, useExpenses } from "@/features/expenses/hooks";
import { BudgetDonutChart } from "@/features/expenses/components/budget-donut-chart";
import { ExpenseCard, SecretAmount } from "@/features/expenses/components/expense-card";
import { AddExpenseDialog } from "@/features/expenses/components/add-expense-dialog";
import { FigmaChip, FigmaChipRow, FigmaCtaButton, FigmaPage, FigmaPageHeader, FigmaPageScroll, FigmaPageTitle, figmaShadowLift } from "@/components/ui/figma";
import { useConfirmDelete } from "@/components/ui/confirm-delete-dialog";
import { BudgetPageSkeleton } from "@/components/ui/page-skeleton";
import type { Trip } from "@/mocks/fixtures/trips";
import { type Expense } from "@/mocks/fixtures/expenses";
import { resolveTripDays } from "@/lib/trip-days";
import { useTripPeople } from "@/features/trips/people-hooks";

export function BudgetTab({ trip }: { trip: Trip }) {
  const { data: expenses, isLoading, isError } = useExpenses(trip.id);
  const { data: tripPeople } = useTripPeople(trip.id);
  const payerNames = useMemo(
    () => (tripPeople ?? []).map((person) => person.displayName),
    [tripPeople],
  );
  const deleteExpense = useDeleteExpense(trip.id);
  const { request: askDelete, dialog: confirmDialog } = useConfirmDelete();
  const [dayFilter, setDayFilter] = useState<number | "all" | "prep">("all");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const chartExpenses = useMemo(() => withoutGiftExpenses(expenses ?? []), [expenses]);
  const total = useMemo(() => sumAmount(chartExpenses), [chartExpenses]);
  const categoryShares = useMemo(() => groupByCategory(chartExpenses), [chartExpenses]);
  const days = useMemo(
    () => resolveTripDays(trip.startDate, trip.endDate),
    [trip.startDate, trip.endDate],
  );

  const paid = useMemo(
    () => summarizeReceiptSettlement(expenses ?? [], payerNames),
    [expenses, payerNames],
  );

  const visible = useMemo(() => {
    const list = expenses ?? [];
    if (dayFilter === "all") return list;
    if (dayFilter === "prep") return list.filter((e) => e.dayIndex == null);
    return list.filter((e) => e.dayIndex === dayFilter);
  }, [expenses, dayFilter]);

  if (isLoading) return <BudgetPageSkeleton />;
  if (isError)
    return (
      <p className="p-6 text-[12px] leading-[18px] font-semibold text-[#E85D4C]">
        비용 정보를 다시 불러와 주세요.
      </p>
    );

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <FigmaPageHeader>
        <FigmaPageTitle>행복 충전 영수증</FigmaPageTitle>
      </FigmaPageHeader>
      <FigmaPageScroll>
      <FigmaPage>
        <p className="sr-only">💰 총 비용 {total.toLocaleString()}원</p>

        <div className={`flex w-full flex-col items-start rounded-[20px] bg-white p-4 ${figmaShadowLift}`}>
          {categoryShares.length > 0 ? (
            <BudgetDonutChart data={categoryShares} total={total} />
          ) : (
            <p className="text-[13px] leading-5 text-[#8E8E8E]">영수증이 깨끗해, 아직까진 무료 행복 중 ☺️</p>
          )}
        </div>

        <section
          className={`flex w-full flex-col items-start gap-2 rounded-[20px] bg-white px-4 pt-5 pb-4 ${figmaShadowLift}`}
          aria-labelledby="dutch-pay-heading"
        >
          <h2
            id="dutch-pay-heading"
            className="w-full text-xs leading-[18px] font-bold tracking-[1px] text-[#B0AAA6] uppercase"
          >
            <span aria-hidden="true">정산</span>
            <span className="sr-only">더치페이 정산</span>
          </h2>
          <div
            className="grid w-full gap-2"
            style={{ gridTemplateColumns: `repeat(${Math.max(paid.people.length + 1, 1)}, minmax(0, 1fr))` }}
          >
            {paid.people.map((person) => (
              <div key={person.name} className="flex min-w-0 flex-col items-center gap-0.5">
                <p className="text-center text-[11px] leading-4 text-[#8C8885]">{person.name}</p>
                <p className="w-full break-all text-center font-nunito text-[13px] leading-[18px] font-bold text-[#4A4543] tabular-nums">
                  {person.total.toLocaleString()}원
                </p>
              </div>
            ))}
            <div className="flex min-w-0 flex-col items-center gap-0.5">
              <p className="text-center text-[11px] leading-4 text-[#8C8885]">🎁</p>
              <SecretAmount
                amount={paid.together}
                hidden
                className="w-full break-all text-center font-nunito text-[13px] leading-[18px] font-bold text-[#4A4543] tabular-nums"
              />
            </div>
          </div>
          <div className="flex w-full items-center justify-center pt-1">
            <p className="break-keep text-center font-nunito text-[13px] leading-5 font-bold text-[#F09040]">
              {paid.people.length === 2 && paid.owe > 0
                ? `${paid.people[0].name} → ${paid.people[1].name} ${paid.owe.toLocaleString()}원`
                : paid.people.length === 2 && paid.owe < 0
                  ? `${paid.people[1].name} → ${paid.people[0].name} ${Math.abs(paid.owe).toLocaleString()}원`
                  : "아직 빚진 사람 없음"}
            </p>
          </div>
        </section>

        <FigmaChipRow aria-label="일차">
          <FigmaChip active={dayFilter === "all"} onClick={() => setDayFilter("all")}>
            전체
          </FigmaChip>
          <FigmaChip active={dayFilter === "prep"} onClick={() => setDayFilter("prep")}>
            여행준비
          </FigmaChip>
          {days.map((d) => (
            <FigmaChip key={d.dayIndex} active={dayFilter === d.dayIndex} onClick={() => setDayFilter(d.dayIndex)}>
              Day {d.dayIndex}
            </FigmaChip>
          ))}
        </FigmaChipRow>

        <div className="flex w-full flex-col items-start gap-2.5">
          {visible.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onDelete={() => askDelete(() => deleteExpense.mutate(expense.id))}
              onEdit={() => setEditing(expense)}
            />
          ))}
        </div>

        <FigmaCtaButton onClick={() => setAddOpen(true)}>+ 긁었다!</FigmaCtaButton>

        <AddExpenseDialog
          tripId={trip.id}
          currency={trip.baseCurrency}
          startDate={trip.startDate}
          endDate={trip.endDate}
          payers={payerNames}
          hideTrigger
          open={addOpen}
          onOpenChange={setAddOpen}
          defaultDayIndex={dayFilter === "all" ? 1 : dayFilter === "prep" ? null : dayFilter}
          onSaved={(saved) => {
            setDayFilter(saved.dayIndex == null ? "prep" : saved.dayIndex);
          }}
        />
        {editing && (
          <AddExpenseDialog
            tripId={trip.id}
            currency={trip.baseCurrency}
            startDate={trip.startDate}
            endDate={trip.endDate}
            payers={payerNames}
            initial={editing}
            open
            onOpenChange={(next) => {
              if (!next) setEditing(null);
            }}
            onSaved={(saved) => {
              setDayFilter(saved.dayIndex == null ? "prep" : saved.dayIndex);
            }}
          />
        )}
        {confirmDialog}
      </FigmaPage>
      </FigmaPageScroll>
    </div>
  );
}
