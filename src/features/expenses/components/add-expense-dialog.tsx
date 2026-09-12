"use client";

import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  FigmaChip,
  FigmaChipRow,
  FigmaCtaButton,
  FigmaFieldLabel,
  FigmaSheetHandle,
  figmaInputClass,
} from "@/components/ui/figma";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateExpense, useUpdateExpense } from "@/features/expenses/hooks";
import { MoneyInput } from "@/components/ui/money-input";
import {
  createExpenseInputSchema,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_EMOJI,
  isGiftPayer,
  type CreateExpenseInput,
  type Expense,
  type ExpenseCategory,
} from "@/mocks/fixtures/expenses";
import { todayIsoSeoul } from "@/lib/date";
import { getTripDays } from "@/lib/trip-days";
import { z } from "zod";

const PAYER_REQUIRED_MESSAGE = "고구마냐... 감자냐... 그것이 문제로다...";

function createExpenseFormSchema(requirePayer: boolean) {
  return createExpenseInputSchema
    .omit({
      tripId: true,
      placeId: true,
      isManual: true,
      date: true,
      paymentMethod: true,
      isBlur: true,
    })
    .extend({
      title: z.string().trim().min(1, "어디다 긁었는지 까먹으면 안 돼!"),
      amount: z.number({ error: "행복 값 입력 필수!" }).positive("행복 값 입력 필수!"),
      paidBy: z.enum(["소희", "준형"]).optional(),
    })
    .superRefine((value, ctx) => {
      if (!requirePayer) return;
      if (value.paidBy === "소희" || value.paidBy === "준형") return;
      ctx.addIssue({
        code: "custom",
        path: ["paidBy"],
        message: PAYER_REQUIRED_MESSAGE,
      });
    });
}

type FormValues = z.infer<ReturnType<typeof createExpenseFormSchema>>;

const PAYERS = [
  { value: "소희", label: "🍠 소희" },
  { value: "준형", label: "🥔 준형" },
] as const;

function payerValue(paidBy?: string): "소희" | "준형" | undefined {
  const payer = paidBy?.trim();
  if (payer === "준형") return "준형";
  if (payer === "소희" || payer === "나") return "소희";
  return undefined;
}

export function AddExpenseDialog({
  tripId,
  currency,
  startDate,
  endDate,
  initial,
  hideTrigger,
  open: openProp,
  onOpenChange,
  defaultDayIndex,
  defaultCategory,
  onSaved,
}: {
  tripId: string;
  currency: string;
  startDate?: string;
  endDate?: string;
  initial?: Expense;
  hideTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultDayIndex?: number | null;
  defaultCategory?: ExpenseCategory;
  onSaved?: (expense: { dayIndex: number | null; category: ExpenseCategory }) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const createExpense = useCreateExpense(tripId);
  const updateExpense = useUpdateExpense(tripId);
  const days = startDate && endDate ? getTripDays(startDate, endDate) : [];
  const requirePayer = !(initial && isGiftPayer(initial.paidBy));
  const formSchema = createExpenseFormSchema(requirePayer);

  function emptyValues(): FormValues {
    return {
      title: "",
      category: defaultCategory ?? "식비",
      amount: undefined as unknown as number,
      currency,
      paidBy: undefined,
      dayIndex: defaultDayIndex ?? days[0]?.dayIndex ?? 1,
    };
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initial
      ? {
          title: initial.title,
          category: initial.category,
          amount: initial.amount,
          currency: initial.currency,
          paidBy: payerValue(initial.paidBy),
          dayIndex: initial.dayIndex,
        }
      : emptyValues(),
  });

  useEffect(() => {
    if (!open || initial) return;
    form.reset(emptyValues());
    // Defaults are captured when the sheet opens; `form` identity changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function onSubmit(values: FormValues) {
    const selectedDay = days.find((d) => d.dayIndex === values.dayIndex);
    const date = initial?.date || selectedDay?.date || startDate || todayIsoSeoul();
    const paymentMethod = initial?.paymentMethod ?? "카드";
    const dayIndex = values.dayIndex ?? null;
    const paidBy =
      values.paidBy ?? (initial && isGiftPayer(initial.paidBy) ? initial.paidBy : undefined);
    if (!paidBy) return;
    if (initial) {
      updateExpense.mutate(
        {
          id: initial.id,
          patch: { ...values, paidBy, date, paymentMethod, dayIndex, isManual: true },
        },
        {
          onSuccess: () => {
            onSaved?.({ dayIndex, category: values.category });
            setOpen(false);
          },
        },
      );
      return;
    }
    const input: CreateExpenseInput = {
      tripId,
      placeId: null,
      isManual: true,
      date,
      paymentMethod,
      isBlur: false,
      ...values,
      paidBy,
      dayIndex,
    };
    createExpense.mutate(input, {
      onSuccess: () => {
        onSaved?.({ dayIndex, category: values.category });
        form.reset(emptyValues());
        setOpen(false);
      },
    });
  }

  const dayIndex = form.watch("dayIndex");
  const errors = form.formState.errors;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && !initial) form.reset(emptyValues());
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!initial && !hideTrigger && (
        <DialogTrigger asChild>
          <FigmaCtaButton>+ 긁었다!</FigmaCtaButton>
        </DialogTrigger>
      )}
      <DialogContent
        showCloseButton={false}
        className="max-h-[min(1048.05px,var(--vv-height,100dvh))] gap-4 overflow-y-auto"
      >
        <FigmaSheetHandle />
        <DialogHeader className="gap-0">
          <DialogTitle className="flex h-[26px] items-center text-[17px] leading-[26px] font-bold text-[#1A1A1A]">
            {initial ? "비용 수정" : "오늘의 행복 값"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <FigmaFieldLabel htmlFor="exp-title">항목 이름</FigmaFieldLabel>
            <Input
              id="exp-title"
              placeholder="예) 야식으로 털어온 동문시장 안주"
              aria-required="true"
              aria-invalid={errors.title ? true : undefined}
              className={figmaInputClass}
              {...form.register("title")}
            />
            {errors.title ? (
              <p className="text-[12px] leading-[18px] text-destructive">{errors.title.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <FigmaFieldLabel htmlFor="exp-amount">금액 (원)</FigmaFieldLabel>
            <Controller
              control={form.control}
              name="amount"
              render={({ field }) => (
                <MoneyInput
                  id="exp-amount"
                  className={figmaInputClass}
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />
            {errors.amount ? (
              <p className="text-[12px] leading-[18px] text-destructive">{errors.amount.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <p className="w-full text-xs leading-[18px] font-semibold text-[#AAAAAA]" id="exp-payer-label">
              결제 요정은 누구?
            </p>
            <Controller
              control={form.control}
              name="paidBy"
              render={({ field }) => (
                <div
                  className="flex w-full items-stretch gap-2"
                  role="group"
                  aria-labelledby="exp-payer-label"
                  aria-required={requirePayer ? "true" : undefined}
                  aria-invalid={errors.paidBy ? true : undefined}
                  aria-describedby={errors.paidBy ? "exp-payer-error" : undefined}
                >
                  {PAYERS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      aria-pressed={field.value === p.value}
                      onClick={() => {
                        field.onChange(p.value);
                        void form.trigger("paidBy");
                      }}
                      className={`flex h-[41px] min-w-0 flex-1 items-center justify-center rounded-[14px] bg-white px-3 text-[14px] leading-[21px] font-bold whitespace-nowrap shadow-[0px_2px_12px_rgba(0,0,0,0.06)] ${
                        field.value === p.value ? "text-[#FF9F43]" : "text-[#555555]"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.paidBy ? (
              <p id="exp-payer-error" role="alert" className="text-[12px] leading-[18px] text-destructive">
                {errors.paidBy.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col">
            <FigmaFieldLabel>일차</FigmaFieldLabel>
            <FigmaChipRow role="group" aria-label="일차">
              {days.map((day) => (
                <FigmaChip
                  key={day.dayIndex}
                  size="sm"
                  active={dayIndex === day.dayIndex}
                  onClick={() => form.setValue("dayIndex", day.dayIndex)}
                >
                  Day {day.dayIndex}
                </FigmaChip>
              ))}
            </FigmaChipRow>
          </div>
          <div className="flex flex-col gap-2">
            <FigmaFieldLabel>카테고리</FigmaFieldLabel>
            <div className="flex w-full flex-wrap gap-2 py-1">
              {EXPENSE_CATEGORIES.map((value) => (
                <FigmaChip
                  key={value}
                  size="sm"
                  active={form.watch("category") === value}
                  onClick={() => form.setValue("category", value)}
                >
                  {EXPENSE_CATEGORY_EMOJI[value]} {value}
                </FigmaChip>
              ))}
            </div>
          </div>
          <FigmaCtaButton
            type="submit"
            disabled={createExpense.isPending || updateExpense.isPending}
          >
            영수증에 넣기
          </FigmaCtaButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
