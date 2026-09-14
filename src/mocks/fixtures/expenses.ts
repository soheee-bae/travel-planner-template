import { z } from "zod";

export const EXPENSE_CATEGORIES = [
  "식비",
  "카페",
  "교통/주유",
  "항공",
  "숙소",
  "쇼핑/선물",
  "놀거리/입장권",
  "기타",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_EMOJI: Record<ExpenseCategory, string> = {
  식비: "🍽️",
  카페: "☕",
  "교통/주유": "🚗",
  항공: "✈️",
  숙소: "🛏️",
  "쇼핑/선물": "🛍️",
  "놀거리/입장권": "🎡",
  기타: "🏷️",
};

/** DB에 남은 예전 비용 카테고리를 현재 종으로 본다. */
export function normalizeExpenseCategory(raw: string): ExpenseCategory {
  if (raw === "식비" || raw === "맛집") return "식비";
  if (raw === "카페") return "카페";
  if (raw === "항공" || raw === "항공권" || raw === "비행기") return "항공";
  if (raw === "교통/주유" || raw === "교통") return "교통/주유";
  if (raw === "숙소") return "숙소";
  if (raw === "쇼핑/선물" || raw === "쇼핑") return "쇼핑/선물";
  if (
    raw === "놀거리/입장권" ||
    raw === "놀거리" ||
    raw === "관광" ||
    raw === "관광·입장" ||
    raw === "액티비티"
  ) {
    return "놀거리/입장권";
  }
  if ((EXPENSE_CATEGORIES as readonly string[]).includes(raw)) return raw as ExpenseCategory;
  return "기타";
}

export const PAYMENT_METHODS = ["현금", "카드", "선불"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** 계획서 v2의 비용 property 11개 전부 담는다(docs/08 P7-01). */
export const expenseSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  title: z.string().min(1).max(120),
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.number().nonnegative(),
  currency: z.string().min(3).max(3),
  date: z.string(), // yyyy-mm-dd
  dayIndex: z.number().int().positive().nullable(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  paidBy: z.string().optional(),
  placeId: z.string().nullable(),
  memo: z.string().optional(),
  isManual: z.boolean(),
  isBlur: z.boolean().optional(),
});
export type Expense = z.infer<typeof expenseSchema>;

export function isGiftPayer(paidBy?: string): boolean {
  const payer = paidBy?.trim();
  return payer === "선물" || payer === "같이";
}

/** 파이·정산 합계에서 빼는 선물. is_blur 항목도 선물로 본다. */
export function isGiftExpense(expense: Pick<Expense, "paidBy" | "isBlur">): boolean {
  return expense.isBlur === true || isGiftPayer(expense.paidBy);
}

export function shouldBlurExpense(expense: Pick<Expense, "isBlur">): boolean {
  return expense.isBlur === true;
}

export function paidByTagLabel(paidBy: string): string {
  if (paidBy === "나" || paidBy === "소희") return "소희";
  if (paidBy === "준형") return "준형";
  return paidBy;
}

export const createExpenseInputSchema = expenseSchema.omit({ id: true });
export type CreateExpenseInput = z.infer<typeof createExpenseInputSchema>;

export const updateExpenseInputSchema = expenseSchema.omit({ id: true, tripId: true }).partial();
export type UpdateExpenseInput = z.infer<typeof updateExpenseInputSchema>;

export const initialExpenses: Expense[] = [
  {
    id: "exp_jeju_1",
    tripId: "trip_jeju",
    title: "제주항공 왕복",
    category: "항공",
    amount: 148000,
    currency: "KRW",
    date: "2026-09-17",
    dayIndex: 1,
    paymentMethod: "카드",
    paidBy: "준형",
    placeId: null,
    isManual: true,
    isBlur: false,
  },
  {
    id: "exp_jeju_2",
    tripId: "trip_jeju",
    title: "파라다이스 호텔",
    category: "숙소",
    amount: 220000,
    currency: "KRW",
    date: "2026-09-17",
    dayIndex: 1,
    paymentMethod: "카드",
    paidBy: "같이",
    placeId: null,
    isManual: true,
    isBlur: false,
  },
  {
    id: "exp_nagoya_1",
    tripId: "trip_nagoya",
    title: "아츠타 호라이켄 히츠마부시",
    category: "식비",
    amount: 4600,
    currency: "JPY",
    date: "2026-11-06",
    dayIndex: 1,
    paymentMethod: "카드",
    paidBy: "소희",
    placeId: "place_nagoya_2",
    isManual: false,
    isBlur: false,
  },
  {
    id: "exp_nagoya_2",
    tripId: "trip_nagoya",
    title: "코메다 커피",
    category: "카페",
    amount: 800,
    currency: "JPY",
    date: "2026-11-07",
    dayIndex: 2,
    paymentMethod: "카드",
    paidBy: "소희",
    placeId: "place_nagoya_3",
    isManual: false,
    isBlur: false,
  },
  {
    id: "exp_nagoya_3",
    tripId: "trip_nagoya",
    title: "지브리 파크 입장권",
    category: "놀거리/입장권",
    amount: 3500,
    currency: "JPY",
    date: "2026-11-07",
    dayIndex: 2,
    paymentMethod: "카드",
    paidBy: "소희",
    placeId: "place_nagoya_1",
    isManual: false,
    isBlur: false,
  },
  {
    id: "exp_nagoya_4",
    tripId: "trip_nagoya",
    title: "지하철 1일 승차권",
    category: "교통/주유",
    amount: 760,
    currency: "JPY",
    date: "2026-11-07",
    dayIndex: 2,
    paymentMethod: "현금",
    paidBy: "소희",
    placeId: null,
    isManual: true,
    isBlur: false,
  },
  {
    id: "exp_nagoya_5",
    tripId: "trip_nagoya",
    title: "오스카상점가 기념품",
    category: "쇼핑/선물",
    amount: 2800,
    currency: "JPY",
    date: "2026-11-06",
    dayIndex: 1,
    paymentMethod: "카드",
    paidBy: "소희",
    placeId: null,
    isManual: true,
    isBlur: false,
  },
];
