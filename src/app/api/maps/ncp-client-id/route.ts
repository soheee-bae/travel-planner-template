import { NextResponse } from "next/server";

export function GET() {
  const clientId =
    process.env.NAVER_MAP_CLIENT_ID ?? process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ?? "";
  return NextResponse.json({ clientId: clientId.length > 0 ? clientId : null });
}
