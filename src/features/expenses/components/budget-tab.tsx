"use client";

import { useMemo, useState } from "react";
import { groupByCategory, groupByDay, sumAmount } from "@/lib/expense-aggregation";
import { useDeleteExpense, useExpenses } from "@/features/expenses/hooks";
import { BudgetDonutChart } from "@/features/expenses/components/budget-donut-chart";
import { ExpenseCard } from "@/features/expenses/components/expense-card";
import { AddExpenseDialog } from "@/features/expenses/components/add-expense-dialog";
import { SoftChip, DashedAddButton, EndMascot } from "@/components/ui/soft-chip";
import type { Trip } from "@/mocks/fixtures/trips";
import type { Expense } from "@/mocks/fixtures/expenses";

export function BudgetTab({ trip }: { trip: Trip }) {
  const { data: expenses, isLoading, isError } = useExpenses(trip.id);
  const deleteExpense = useDeleteExpense(trip.id);
  const [group, setGroup] = useState<"day" | "category">("day");
  const [dayFilter, setDayFilter] = useState<number | "all">("all");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const total = useMemo(() => sumAmount(expenses ?? []), [expenses]);
  const categoryShares = useMemo(() => groupByCategory(expenses ?? []), [expenses]);
  const days = useMemo(() => groupByDay(expenses ?? []).map((g) => g.dayIndex), [expenses]);

  const paid = useMemo(() => {
    let me = 0;
    let jun = 0;
    let together = 0;
    for (const e of expenses ?? []) {
      if (e.paidBy === "준형") jun += e.amount;
      else if (e.paidBy === "같이") together += e.amount;
      else me += e.amount;
    }
    const owe = Math.round((jun - me) / 2);
    return { me, jun, together, owe };
  }, [expenses]);

  const visible = useMemo(() => {
    const list = expenses ?? [];
    if (dayFilter === "all") return list;
    return list.filter((e) => e.dayIndex === dayFilter);
  }, [expenses, dayFilter]);

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">불러오는 중…</p>;
  if (isError)
    return <p className="p-6 text-sm text-destructive">비용 정보를 불러오지 못했습니다.</p>;

  return (
    <div className="mx-auto flex w-full flex-col gap-4 p-4 pb-6">
      <div>
        <h2 className="font-heading text-xl font-bold">💸 여행 비용</h2>
        <p className="text-sm font-bold text-foreground">💰 총 비용 {total.toLocaleString()}원</p>
      </div>

      <div className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border">
        {categoryShares.length > 0 ? (
          <BudgetDonutChart data={categoryShares} total={total} />
        ) : (
          <p className="text-sm text-muted-foreground">아직 비용이 없어요</p>
        )}
      </div>

      <section className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border" aria-labelledby="dutch-pay-heading">
        <h2 id="dutch-pay-heading" className="mb-3 text-sm font-bold">
          더치페이 정산
        </h2>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="text-muted-foreground">나 납부</p>
            <p className="font-bold">{paid.me.toLocaleString()}원</p>
          </div>
          <div>
            <p className="text-muted-foreground">준형 납부</p>
            <p className="font-bold">{paid.jun.toLocaleString()}원</p>
          </div>
          <div>
            <p className="text-muted-foreground">같이</p>
            <p className="font-bold">{paid.together.toLocaleString()}원</p>
          </div>
        </div>
        <p className="mt-3 text-center text-sm font-bold text-primary">
          {paid.owe > 0
            ? `나 -> 준형 ${paid.owe.toLocaleString()}원 줘야 함`
            : paid.owe < 0
              ? `준형 -> 나 ${Math.abs(paid.owe).toLocaleString()}원 줘야 함`
              : "정산할 금액이 없어요"}
        </p>
      </section>

      <div className="flex gap-2">
        <SoftChip active={group === "day"} onClick={() => setGroup("day")}>
          날짜별
        </SoftChip>
        <SoftChip active={group === "category"} onClick={() => setGroup("category")}>
          카테고리별
        </SoftChip>
      </div>

      {group === "day" ? (
        <div className="flex gap-2 overflow-x-auto">
          <SoftChip active={dayFilter === "all"} onClick={() => setDayFilter("all")}>
            전체
          </SoftChip>
          {days
            .filter((d): d is number => d != null)
            .map((d) => (
              <SoftChip key={d} active={dayFilter === d} onClick={() => setDayFilter(d)}>
                Day{d}
              </SoftChip>
            ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {categoryShares.map((g) => (
            <div key={g.category} className="flex justify-between rounded-2xl bg-muted px-3 py-2 text-sm">
              <span>{g.category}</span>
              <span className="font-bold">{g.total.toLocaleString()}원</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {visible.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            onDelete={() => deleteExpense.mutate(expense.id)}
            onEdit={() => setEditing(expense)}
          />
        ))}
      </div>

      <DashedAddButton onClick={() => setAddOpen(true)}>비용 추가</DashedAddButton>
      <EndMascot />

      <AddExpenseDialog
        tripId={trip.id}
        currency={trip.baseCurrency}
        hideTrigger
        open={addOpen}
        onOpenChange={setAddOpen}
      />
      {editing && (
        <AddExpenseDialog
          tripId={trip.id}
          currency={trip.baseCurrency}
          initial={editing}
          open
          onOpenChange={(next) => {
            if (!next) setEditing(null);
          }}
        />
      )}
    </div>
  );
}
