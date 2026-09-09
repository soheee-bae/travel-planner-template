/**
 * mock(MSW/Next mock API) vs Supabase 전환.
 * - 단위 테스트는 항상 mock
 * - 개발은 기본 mock. `.env.local`에 NEXT_PUBLIC_ENABLE_MSW=false 일 때만 실 DB
 * - URL만 있고 ENABLE_MSW를 안 적으면 예전엔 supabase로 가서 trip_jeju가 404였다
 */
export function isMockData(): boolean {
  if (process.env.NODE_ENV === "test") return true;
  if (process.env.NEXT_PUBLIC_ENABLE_MSW === "true") return true;
  if (process.env.NEXT_PUBLIC_ENABLE_MSW === "false") return false;
  if (process.env.NODE_ENV !== "production") return true;
  return !process.env.NEXT_PUBLIC_SUPABASE_URL;
}
