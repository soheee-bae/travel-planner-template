import { IconAction } from "@/components/ui/icon-action";
import { cn } from "@/lib/utils";
import { IllustrationIcon } from "@/components/ui/illustration-icon";
import { EXPENSE_CATEGORY_ICON, EXPENSE_CATEGORY_TONE } from "@/lib/illustrations";
import {
  paidByTagLabel,
  shouldBlurExpense,
  type Expense,
} from "@/mocks/fixtures/expenses";

export function SecretAmount({
  amount,
  hidden,
  className,
}: {
  amount: number;
  hidden: boolean;
  className?: string;
}) {
  const text = `${amount.toLocaleString()}원`;
  if (!hidden) {
    return <p className={className}>{text}</p>;
  }
  return (
    <p className={className} aria-label="숨긴 금액">
      <span className="inline-block select-none blur-[3.5px]" aria-hidden="true">
        {text}
      </span>
    </p>
  );
}

export function ExpenseCard({
  expense,
  onDelete,
  onEdit,
}: {
  expense: Expense;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const blurred = shouldBlurExpense(expense);
  return (
    <div className="flex w-full flex-col items-start rounded-[20px] bg-white px-4 py-3.5 shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex min-h-[58px] w-full items-center gap-3">
        <div
          className={cn(
            "flex size-[46px] shrink-0 items-center justify-center overflow-hidden rounded-2xl p-1.5",
            EXPENSE_CATEGORY_TONE[expense.category].iconBg,
          )}
        >
          <IllustrationIcon src={EXPENSE_CATEGORY_ICON[expense.category]} className="size-full" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <p
            className={cn(
              "block h-[23px] w-full truncate text-[15px] leading-[22px] font-bold text-[#1A1A1A]",
              blurred && "select-none blur-[3.5px]",
            )}
          >
            {expense.title}
          </p>
          <div className="flex h-[23px] w-full items-start gap-1 pt-1">
            <span
              className={cn(
                "flex h-[19px] items-center rounded-[99px] px-2 py-0.5 text-[10px] leading-[15px] font-semibold text-[#555555]",
                EXPENSE_CATEGORY_TONE[expense.category].chip,
              )}
            >
              {expense.category}
            </span>
            {expense.paidBy ? (
              <span className="flex h-[19px] items-center rounded-[99px] bg-[#F5F5F5] px-2 py-0.5 text-[10px] leading-[15px] font-semibold text-[#555555]">
                {paidByTagLabel(expense.paidBy)}
              </span>
            ) : null}
          </div>
        </div>
        <SecretAmount
          amount={expense.amount}
          hidden={blurred}
          className="flex h-[21px] w-[71px] shrink-0 items-center font-nunito text-[14px] leading-[21px] font-bold text-[#4A4543]"
        />
        <div className="flex h-[50px] w-[25px] shrink-0 flex-col items-center justify-center gap-3">
          <IconAction action="edit" label={`${expense.title} 수정`} onClick={onEdit} />
          <IconAction action="delete" label={`${expense.title} 삭제`} onClick={onDelete} />
        </div>
      </div>
    </div>
  );
}
