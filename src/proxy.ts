import { NextResponse, type NextRequest } from "next/server";

/**
 * 로그인은 현재 범위 밖이다. 세션 가드/리다이렉트는 넣지 않는다.
 * 환경변수가 있어도 모든 경로를 그대로 통과한다.
 */
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
