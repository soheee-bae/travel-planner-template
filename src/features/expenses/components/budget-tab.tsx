"use client";

import { useMemo, useState } from "react";
import { groupByCategory, sumAmount } from "@/lib/expense-aggregation";
import { useDeleteExpense, useExpenses } from "@/features/expenses/hooks";
import { BudgetDonutChart } from "@/features/expenses/components/budget-donut-chart";
import { ExpenseCard, SecretAmount } from "@/features/expenses/components/expense-card";
import { AddExpenseDialog } from "@/features/expenses/components/add-expense-dialog";
import { FigmaChip, FigmaChipRow, FigmaCtaButton, FigmaPage, FigmaPageHeader, FigmaPageTitle, figmaShadowLift } from "@/components/ui/figma";
import { useConfirmDelete } from "@/components/ui/confirm-delete-dialog";
import type { Trip } from "@/mocks/fixtures/trips";
import {
  EXPENSE_CATEGORIES,
  isGiftPayer,
  type Expense,
  type ExpenseCategory,
} from "@/mocks/fixtures/expenses";
import { getTripDays } from "@/lib/trip-days";

export function BudgetTab({ trip }: { trip: Trip }) {
  const { data: expenses, isLoading, isError } = useExpenses(trip.id);
  const deleteExpense = useDeleteExpense(trip.id);
  const { request: askDelete, dialog: confirmDialog } = useConfirmDelete();
  const [group, setGroup] = useState<"day" | "category">("day");
  const [dayFilter, setDayFilter] = useState<number | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | null>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const total = useMemo(() => sumAmount(expenses ?? []), [expenses]);
  const categoryShares = useMemo(() => groupByCategory(expenses ?? []), [expenses]);
  const days = useMemo(
    () => (trip.startDate && trip.endDate ? getTripDays(trip.startDate, trip.endDate) : []),
    [trip.startDate, trip.endDate],
  );

  const paid = useMemo(() => {
    let me = 0;
    let jun = 0;
    let together = 0;
    for (const e of expenses ?? []) {
      if (e.paidBy === "준형") jun += e.amount;
      else if (isGiftPayer(e.paidBy)) together += e.amount;
      else me += e.amount;
    }
    const owe = Math.round((jun - me) / 2);
    return { me, jun, together, owe };
  }, [expenses]);

  const visible = useMemo(() => {
    const list = expenses ?? [];
    if (group === "category") {
      const selected = categoryFilter ?? (categoryShares[0]?.category as ExpenseCategory | undefined);
      if (!selected) return [];
      return list.filter((e) => e.category === selected);
    }
    if (dayFilter === "all") return list;
    return list.filter((e) => e.dayIndex === dayFilter);
  }, [expenses, group, dayFilter, categoryFilter, categoryShares]);
  const visibleTotal = useMemo(() => sumAmount(visible), [visible]);
  const activeCategory = categoryFilter ?? (categoryShares[0]?.category as ExpenseCategory | undefined);

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">불러오는 중…</p>;
  if (isError)
    return <p className="p-6 text-sm text-destructive">비용 정보를 다시 불러와 주세요.</p>;

  return (
    <div className="flex min-h-full flex-col bg-white">
      <FigmaPageHeader>
        <FigmaPageTitle>행복 충전 영수증</FigmaPageTitle>
      </FigmaPageHeader>
      <FigmaPage>
        <p className="sr-only">💰 총 비용 {total.toLocaleString()}원</p>

        <div className={`flex w-full flex-col items-start rounded-[20px] bg-white p-4 ${figmaShadowLift}`}>
          {categoryShares.length > 0 ? (
            <BudgetDonutChart data={categoryShares} total={total} />
          ) : (
            <p className="text-[13px] leading-5 text-[#8E8E8E]">영수증이 깨끗해, 아직까진 무료 행복 중 🍊</p>
          )}
        </div>

        <section
          className={`flex w-full flex-col items-start gap-2 rounded-[20px] bg-white px-4 pt-5 pb-4 ${figmaShadowLift}`}
          aria-labelledby="dutch-pay-heading"
        >
          <h2
            id="dutch-pay-heading"
            className="flex h-[18px] w-full items-center text-xs leading-[18px] font-bold tracking-[1px] text-[#B0AAA6] uppercase"
          >
            <span aria-hidden="true">정산 💸</span>
            <span className="sr-only">더치페이 정산</span>
          </h2>
          <div className="flex h-10 w-full items-start justify-around gap-[50.5px]">
            <div className="flex h-10 flex-1 flex-col items-center">
              <p className="flex h-[17px] items-center text-center text-[11px] leading-4 text-[#8C8885]">소희</p>
              <p className="flex h-[23px] items-center font-nunito text-[15px] leading-[22px] font-bold text-[#4A4543]">
                {paid.me.toLocaleString()}원
              </p>
            </div>
            <div className="flex h-10 flex-1 flex-col items-center">
              <p className="flex h-[17px] items-center text-center text-[11px] leading-4 text-[#8C8885]">준형</p>
              <p className="flex h-[23px] items-center font-nunito text-[15px] leading-[22px] font-bold text-[#4A4543]">
                {paid.jun.toLocaleString()}원
              </p>
            </div>
            <div className="flex h-10 flex-1 flex-col items-center">
              <p className="flex h-[17px] items-center text-center text-[11px] leading-4 text-[#8C8885]">🎁</p>
              <SecretAmount
                amount={paid.together}
                hidden
                className="flex h-[23px] w-[72px] items-center justify-center font-nunito text-[15px] leading-[22px] font-bold text-[#4A4543]"
              />
            </div>
          </div>
          <div className="flex h-6 w-full items-center justify-center pt-1">
            <p className="flex h-5 items-center font-nunito text-[13px] leading-5 font-bold text-[#F09040]">
              {paid.owe > 0
                ? `소희 → 준형 ${paid.owe.toLocaleString()}원`
                : paid.owe < 0
                  ? `준형 → 소희 ${Math.abs(paid.owe).toLocaleString()}원`
                  : "아직 빚진 사람 없음 ✌️"}
            </p>
          </div>
        </section>

        <FigmaChipRow>
          <FigmaChip
            tone="dark"
            active={group === "day"}
            onClick={() => {
              setGroup("day");
              setDayFilter("all");
            }}
          >
            날짜별
          </FigmaChip>
          <FigmaChip
            tone="dark"
            active={group === "category"}
            onClick={() => {
              setGroup("category");
              setCategoryFilter(
                (prev) =>
                  prev ?? (categoryShares[0]?.category as ExpenseCategory | undefined) ?? null,
              );
            }}
          >
            카테고리별
          </FigmaChip>
        </FigmaChipRow>

        {group === "day" ? (
          <FigmaChipRow>
            <FigmaChip active={dayFilter === "all"} onClick={() => setDayFilter("all")}>
              전체
            </FigmaChip>
            {days.map((d) => (
              <FigmaChip key={d.dayIndex} active={dayFilter === d.dayIndex} onClick={() => setDayFilter(d.dayIndex)}>
                Day {d.dayIndex}
              </FigmaChip>
            ))}
          </FigmaChipRow>
        ) : (
          <div className="flex w-full flex-col gap-3">
            <FigmaChipRow>
              {EXPENSE_CATEGORIES.map((category) => (
                <FigmaChip
                  key={category}
                  active={activeCategory === category}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </FigmaChip>
              ))}
            </FigmaChipRow>
            <p className="w-full text-right font-nunito text-[15px] leading-[22px] font-bold text-[#1A1A1A]">
              총 {visibleTotal.toLocaleString()}원
            </p>
          </div>
        )}

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
          hideTrigger
          open={addOpen}
          onOpenChange={setAddOpen}
          defaultDayIndex={group === "day" ? (dayFilter === "all" ? 1 : dayFilter) : undefined}
          defaultCategory={group === "category" ? activeCategory : undefined}
          onSaved={(saved) => {
            if (group === "day") {
              if (saved.dayIndex != null) setDayFilter(saved.dayIndex);
              return;
            }
            setCategoryFilter(saved.category);
          }}
        />
        {editing && (
          <AddExpenseDialog
            tripId={trip.id}
            currency={trip.baseCurrency}
            startDate={trip.startDate}
            endDate={trip.endDate}
            initial={editing}
            open
            onOpenChange={(next) => {
              if (!next) setEditing(null);
            }}
            onSaved={(saved) => {
              if (group === "day") {
                if (saved.dayIndex != null) setDayFilter(saved.dayIndex);
                return;
              }
              setCategoryFilter(saved.category);
            }}
          />
        )}
        {confirmDialog}
      </FigmaPage>
    </div>
  );
}
