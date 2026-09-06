/**
 * mock(MSW) vs Supabase 전환.
 * - 단위 테스트는 항상 mock
 * - e2e는 NEXT_PUBLIC_ENABLE_MSW=true 로 빌드한다
 * - 실 DB+로그인을 쓰려면 ENABLE_MSW=false + URL/키
 */
export function isMockData(): boolean {
  if (process.env.NODE_ENV === "test") return true;
  if (process.env.NEXT_PUBLIC_ENABLE_MSW === "true") return true;
  if (process.env.NEXT_PUBLIC_ENABLE_MSW === "false") return false;
  return !process.env.NEXT_PUBLIC_SUPABASE_URL;
}
