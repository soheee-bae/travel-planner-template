/**
 * mock vs Supabase.
 * - 테스트·e2e(ENABLE_MSW=true)는 mock
 * - URL이 있으면 로그인 없이 실 DB (RLS가 anon 허용이어야 함)
 */
export function isMockData(): boolean {
  if (process.env.NODE_ENV === "test") return true;
  if (process.env.NEXT_PUBLIC_ENABLE_MSW === "true") return true;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) return false;
  return process.env.NODE_ENV !== "production";
}
