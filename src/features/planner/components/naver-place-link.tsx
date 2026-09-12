"use client";

import {
  isAndroidUserAgent,
  isMobileUserAgent,
  naverPlaceAppHref,
  naverPlaceWebUrl,
} from "@/lib/naver-map-links";

export function NaverPlaceLink({
  lat,
  lng,
  name,
  children,
  className,
}: {
  lat: number;
  lng: number;
  name: string;
  children: string;
  className?: string;
}) {
  const webHref = naverPlaceWebUrl(lat, lng, name);

  return (
    <a
      href={webHref}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        const ua = navigator.userAgent;
        if (!isMobileUserAgent(ua)) return;
        event.preventDefault();
        const appHref = naverPlaceAppHref(lat, lng, name, ua, window.location.origin);
        if (isAndroidUserAgent(ua)) {
          window.location.href = appHref;
          return;
        }
        const started = Date.now();
        window.location.href = appHref;
        window.setTimeout(() => {
          if (Date.now() - started < 2000) {
            window.location.href = webHref;
          }
        }, 1200);
      }}
    >
      {children}
    </a>
  );
}
