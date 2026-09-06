import { drivingSummaryToLeg, type LatLng, type TravelLeg } from "@/lib/travel-leg";

const GEOCODE_URL = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode";
const DIRECTION_URL = "https://maps.apigw.ntruss.com/map-direction/v1/driving";

export function getNaverMapsCredentials(): { id: string; secret: string } | null {
  const id = process.env.NAVER_MAP_CLIENT_ID ?? process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const secret = process.env.NAVER_MAP_CLIENT_SECRET;
  if (!id || !secret) return null;
  return { id, secret };
}

function naverHeaders(creds: { id: string; secret: string }): HeadersInit {
  return {
    "X-NCP-APIGW-API-KEY-ID": creds.id,
    "X-NCP-APIGW-API-KEY": creds.secret,
  };
}

interface NaverGeocodeAddress {
  x?: string;
  y?: string;
  roadAddress?: string;
  jibunAddress?: string;
}

interface NaverGeocodeResponse {
  status?: string;
  addresses?: NaverGeocodeAddress[];
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export function parseNaverGeocode(data: unknown): GeocodeResult | null {
  if (typeof data !== "object" || data === null) return null;
  const body = data as NaverGeocodeResponse;
  const first = body.addresses?.[0];
  if (!first?.x || !first?.y) return null;
  const lng = Number(first.x);
  const lat = Number(first.y);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const displayName = first.roadAddress || first.jibunAddress || "";
  return { lat, lng, displayName };
}

export async function geocodeWithNaver(query: string): Promise<GeocodeResult | null> {
  const creds = getNaverMapsCredentials();
  if (!creds) return null;

  const url = new URL(GEOCODE_URL);
  url.searchParams.set("query", query);

  const res = await fetch(url, { headers: naverHeaders(creds), cache: "no-store" });
  if (!res.ok) return null;
  return parseNaverGeocode(await res.json());
}

interface NaverDirectionResponse {
  code?: number;
  route?: {
    traoptimal?: Array<{
      summary?: { distance?: number; duration?: number };
    }>;
  };
}

export function parseNaverDriving(data: unknown): TravelLeg | null {
  if (typeof data !== "object" || data === null) return null;
  const body = data as NaverDirectionResponse;
  if (body.code !== 0) return null;
  const summary = body.route?.traoptimal?.[0]?.summary;
  if (summary?.distance == null || summary.duration == null) return null;
  if (!Number.isFinite(summary.distance) || !Number.isFinite(summary.duration)) return null;
  return drivingSummaryToLeg(summary.distance, summary.duration);
}

export async function driveWithNaver(start: LatLng, goal: LatLng): Promise<TravelLeg | null> {
  const creds = getNaverMapsCredentials();
  if (!creds) return null;

  const url = new URL(DIRECTION_URL);
  url.searchParams.set("start", `${start.lng},${start.lat}`);
  url.searchParams.set("goal", `${goal.lng},${goal.lat}`);
  url.searchParams.set("option", "traoptimal");

  const res = await fetch(url, { headers: naverHeaders(creds), cache: "no-store" });
  if (!res.ok) return null;
  return parseNaverDriving(await res.json());
}
