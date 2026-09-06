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
    fitBounds: (bounds: unknown) => void;
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

export function getNaverMapClientId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  return id && id.length > 0 ? id : undefined;
}

export function loadNaverMapsScript(clientId: string): Promise<NaverMapsApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("window 없음"));
  }
  if (window.naver?.maps) return Promise.resolve(window.naver.maps);

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      const check = () => {
        if (window.naver?.maps) resolve(window.naver.maps);
        else reject(new Error("네이버 지도 스크립트 로드 실패"));
      };
      existing.addEventListener("load", check);
      existing.addEventListener("error", () => reject(new Error("네이버 지도 스크립트 로드 실패")));
      if (window.naver?.maps) resolve(window.naver.maps);
    });
  }

  return new Promise((resolve, reject) => {
    window.__onNaverMapsReady = () => {
      if (window.naver?.maps) resolve(window.naver.maps);
      else reject(new Error("네이버 지도 객체가 없습니다"));
    };
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}&callback=__onNaverMapsReady`;
    script.async = true;
    script.onerror = () => reject(new Error("네이버 지도 스크립트 로드 실패"));
    document.head.appendChild(script);
  });
}
