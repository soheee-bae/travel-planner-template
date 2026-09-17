export interface NaverLatLng {
  lat: () => number;
  lng: () => number;
}

export interface NaverMapsApi {
  Position?: { TOP_LEFT: unknown; LEFT_TOP: unknown };
  Map: new (
    el: HTMLElement,
    opts: Record<string, unknown>,
  ) => {
    fitBounds: (
      bounds: unknown,
      margin?: number | { top?: number; right?: number; bottom?: number; left?: number },
    ) => void;
    setCenter?: (latlng: unknown) => void;
    setZoom?: (zoom: number) => void;
    panTo?: (latlng: unknown) => void;
    morph?: (latlng: unknown, zoom?: number) => void;
    autoResize?: () => void;
    destroy?: () => void;
  };
  LatLng: new (lat: number, lng: number) => unknown;
  LatLngBounds: new (sw: unknown, ne: unknown) => {
    extend: (latlng: unknown) => void;
  };
  Marker: new (opts: {
    position: unknown;
    map: unknown;
    title?: string;
    zIndex?: number;
    icon?: { content: string; anchor: unknown };
  }) => { setMap: (map: unknown) => void };
  Point: new (x: number, y: number) => unknown;
  Polyline: new (opts: {
    map: unknown;
    path: unknown[];
    strokeColor: string;
    strokeWeight: number;
    strokeOpacity: number;
    strokeStyle?: string;
    clickable?: boolean;
  }) => { setMap: (map: unknown) => void };
  Event: {
    addListener: (target: unknown, event: string, handler: () => void) => unknown;
  };
}

declare global {
  interface Window {
    naver?: { maps: NaverMapsApi };
    __onNaverMapsReady?: () => void;
  }
}

const SCRIPT_ID = "naver-maps-sdk";
const LOAD_TIMEOUT_MS = 8_000;

let inflight: Promise<NaverMapsApi> | null = null;

export function getNaverMapClientId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  return id && id.length > 0 ? id : undefined;
}

export function loadNaverMapsScript(clientId: string): Promise<NaverMapsApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("window 없음"));
  }
  if (window.naver?.maps) return Promise.resolve(window.naver.maps);
  if (inflight) return inflight;

  inflight = new Promise<NaverMapsApi>((resolve, reject) => {
    let settled = false;

    const succeed = (): boolean => {
      if (settled) return true;
      const maps = window.naver?.maps;
      if (!maps) return false;
      settled = true;
      resolve(maps);
      return true;
    };

    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      inflight = null;
      reject(new Error(message));
    };

    window.__onNaverMapsReady = () => {
      succeed();
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!existing) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}&callback=__onNaverMapsReady`;
      script.async = true;
      script.onerror = () => fail("네이버 지도 스크립트 로드 실패");
      document.head.appendChild(script);
    } else {
      existing.addEventListener("error", () => fail("네이버 지도 스크립트 로드 실패"), { once: true });
    }

    const started = Date.now();
    const poll = () => {
      if (succeed()) return;
      if (Date.now() - started > LOAD_TIMEOUT_MS) {
        fail("네이버 지도 스크립트 로드 실패");
        return;
      }
      window.setTimeout(poll, 50);
    };
    poll();
  });

  return inflight;
}
