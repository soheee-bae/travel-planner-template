import type { PostgrestError } from "@supabase/supabase-js";

export function throwIfError<T>(result: {
  data: T;
  error: PostgrestError | null;
}): NonNullable<T> {
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (result.data === null || result.data === undefined) {
    throw new Error("데이터가 없습니다.");
  }
  return result.data;
}

export function throwIfWriteError(error: PostgrestError | null): void {
  if (error) throw new Error(error.message);
}

export function asNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function asRequiredNumber(value: unknown): number {
  const n = asNumber(value);
  if (n === undefined) throw new Error("숫자 필드가 비어 있습니다.");
  return n;
}

export function asTime(value: unknown): string | undefined {
  if (typeof value !== "string" || value === "") return undefined;
  return value.slice(0, 5);
}
