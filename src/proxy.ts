import { NextResponse, type NextRequest } from "next/server";

/**
 * V1: 로그인·공유는 V2. 세션 가드 없이 통과한다.
 * /login, /me, 초대 라우트 코드는 남겨 두되 네비에서 숨긴다.
 */
export async function proxy(request: NextRequest) {
  void request;
  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
