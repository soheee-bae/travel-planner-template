import { IconAction } from "@/components/ui/icon-action";
import type { Expense } from "@/mocks/fixtures/expenses";

const CAT_ICON: Record<Expense["category"], string> = {
  식비: "🍜",
  숙소: "🏨",
  교통: "🚌",
  "관광·입장": "🌿",
  쇼핑: "🛍️",
  항공: "✈️",
  통신: "📱",
  액티비티: "🎢",
  기타: "📌",
};

const CAT_TINT: Record<Expense["category"], string> = {
  식비: "bg-[#FFE8EE]",
  숙소: "bg-[#E8F4FF]",
  교통: "bg-[#FFF1D6]",
  "관광·입장": "bg-[#E2FBE9]",
  쇼핑: "bg-[#FFF6C8]",
  항공: "bg-[#E8F4FF]",
  통신: "bg-muted",
  액티비티: "bg-[#F3E9FE]",
  기타: "bg-muted",
};

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
    <div className="flex items-center gap-3 rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border">
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-2xl text-xl ${CAT_TINT[expense.category]}`}
      >
        {CAT_ICON[expense.category]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{expense.title}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {expense.dayIndex ? (
            <span className="rounded-full bg-[#E8F4FF] px-2 py-0.5 text-[10px] font-bold text-[#3A7CA5]">
              Day {expense.dayIndex}
            </span>
          ) : null}
          {expense.paidBy ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {expense.paidBy}
            </span>
          ) : null}
        </div>
      </div>
      <p className="shrink-0 text-sm font-extrabold">{expense.amount.toLocaleString()}원</p>
      <div className="flex shrink-0 flex-col">
        <IconAction action="edit" label={`${expense.title} 수정`} onClick={onEdit} />
        <IconAction action="delete" label={`${expense.title} 삭제`} onClick={onDelete} />
      </div>
    </div>
  );
}
