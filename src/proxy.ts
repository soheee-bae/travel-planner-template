import { NextResponse, type NextRequest } from "next/server";

/**
 * V1: 로그인 없음. 세션 가드 없이 통과한다.
 */
export async function proxy(request: NextRequest) {
  void request;
  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
