import { IconAction } from "@/components/ui/icon-action";
import type { Expense } from "@/mocks/fixtures/expenses";

export function ExpenseCard({
  expense,
  onDelete,
  onEdit,
}: {
  expense: Expense;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-foreground">{expense.title}</p>
        <p className="text-xs text-muted-foreground">
          {expense.category} · {expense.paymentMethod}
          {expense.paidBy && ` · ${expense.paidBy}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-money">
          {expense.currency} {expense.amount.toLocaleString()}
        </span>
        <IconAction action="edit" label={`${expense.title} 수정`} onClick={onEdit} />
        <IconAction action="delete" label={`${expense.title} 삭제`} onClick={onDelete} />
      </div>
    </div>
  );
}
