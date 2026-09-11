import { createClient } from "@/lib/supabase/client";
import { asRequiredNumber, throwIfError, throwIfWriteError } from "@/lib/supabase/throw";
import { toClientTripId, toDbTripId } from "@/lib/trip-ids";
import type {
  CreateExpenseInput,
  Expense,
  ExpenseCategory,
  PaymentMethod,
  UpdateExpenseInput,
} from "@/mocks/fixtures/expenses";

interface ExpenseRow {
  id: string;
  trip_id: string;
  title: string;
  category: ExpenseCategory;
  amount: number | string;
  currency: string;
  date: string;
  day_index: number | null;
  payment_method: PaymentMethod;
  paid_by: string | null;
  place_id: string | null;
  memo: string | null;
  is_manual: boolean;
}

function toExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    tripId: toClientTripId(row.trip_id),
    title: row.title,
    category: row.category,
    amount: asRequiredNumber(row.amount),
    currency: row.currency,
    date: row.date,
    dayIndex: row.day_index,
    paymentMethod: row.payment_method,
    paidBy: row.paid_by ?? undefined,
    placeId: row.place_id,
    memo: row.memo ?? undefined,
    isManual: row.is_manual,
  };
}

function toRow(input: CreateExpenseInput | UpdateExpenseInput): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if ("tripId" in input && input.tripId) row.trip_id = toDbTripId(input.tripId);
  if (input.title !== undefined) row.title = input.title;
  if (input.category !== undefined) row.category = input.category;
  if (input.amount !== undefined) row.amount = input.amount;
  if (input.currency !== undefined) row.currency = input.currency;
  if (input.date !== undefined) row.date = input.date;
  if (input.dayIndex !== undefined) row.day_index = input.dayIndex;
  if (input.paymentMethod !== undefined) row.payment_method = input.paymentMethod;
  if (input.paidBy !== undefined) row.paid_by = input.paidBy ?? null;
  if (input.placeId !== undefined) row.place_id = input.placeId;
  if (input.memo !== undefined) row.memo = input.memo ?? null;
  if (input.isManual !== undefined) row.is_manual = input.isManual;
  return row;
}

export async function fetchExpenses(tripId: string): Promise<Expense[]> {
  const supabase = createClient();
  const result = await supabase.from("expenses").select("*").eq("trip_id", toDbTripId(tripId));
  return throwIfError(result).map(toExpense);
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const supabase = createClient();
  const result = await supabase.from("expenses").insert(toRow(input)).select("*").single();
  return toExpense(throwIfError(result));
}

export async function updateExpense(
  tripId: string,
  id: string,
  patch: UpdateExpenseInput,
): Promise<Expense> {
  const supabase = createClient();
  const result = await supabase
    .from("expenses")
    .update(toRow(patch))
    .eq("trip_id", toDbTripId(tripId))
    .eq("id", id)
    .select("*")
    .single();
  return toExpense(throwIfError(result));
}

export async function deleteExpense(tripId: string, id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("trip_id", toDbTripId(tripId))
    .eq("id", id);
  throwIfWriteError(error);
}
