import { NextResponse } from "next/server";
import { z } from "zod";
import { driveWithNaver } from "@/lib/naver-maps";
import {
  estimateWalkLeg,
  latLngSchema,
  legCacheKey,
  travelLegSchema,
  type LatLng,
  type TravelLeg,
} from "@/lib/travel-leg";

const bodySchema = z.object({
  legs: z
    .array(
      z.object({
        start: latLngSchema,
        end: latLngSchema,
      }),
    )
    .max(20),
});

const cache = new Map<string, TravelLeg>();

async function resolveLeg(start: LatLng, end: LatLng): Promise<TravelLeg> {
  const key = `car:${legCacheKey(start, end)}`;
  const hit = cache.get(key);
  if (hit) return hit;

  let naver: TravelLeg | null = null;
  try {
    naver = await driveWithNaver(start, end);
  } catch {
    naver = null;
  }
  const leg = naver ?? estimateWalkLeg(start, end);
  if (leg.source === "naver") cache.set(key, leg);
  return leg;
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "legs 형식이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    const legs = await Promise.all(
      parsed.data.legs.map(({ start, end }) => resolveLeg(start, end)),
    );
    return NextResponse.json({ legs: z.array(travelLegSchema).parse(legs) });
  } catch {
    return NextResponse.json({ message: "경로 요청에 실패했습니다." }, { status: 502 });
  }
}
