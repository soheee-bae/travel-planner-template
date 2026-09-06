/**
 * 기본은 MSW mock. 로그인 없는 현재 범위에서는 실 DB를 쓰지 않는다.
 * 나중에 Auth를 다시 켤 때만 NEXT_PUBLIC_ENABLE_MSW=false.
 */
export function isMockData(): boolean {
  if (process.env.NODE_ENV === "test") return true;
  return process.env.NEXT_PUBLIC_ENABLE_MSW !== "false";
}
