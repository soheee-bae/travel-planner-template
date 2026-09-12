const DEFAULT_APP_NAME = "http://localhost:3000";

export function naverPlaceScheme(
  lat: number,
  lng: number,
  name: string,
  appname = DEFAULT_APP_NAME,
): string {
  return `nmap://place?lat=${lat}&lng=${lng}&name=${encodeURIComponent(name)}&appname=${encodeURIComponent(appname)}`;
}

export function naverPlaceAndroidIntent(
  lat: number,
  lng: number,
  name: string,
  webUrl: string,
  appname = DEFAULT_APP_NAME,
): string {
  const path = `place?lat=${lat}&lng=${lng}&name=${encodeURIComponent(name)}&appname=${encodeURIComponent(appname)}`;
  return `intent://${path}#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.nmap;S.browser_fallback_url=${encodeURIComponent(webUrl)};end`;
}

/** NCP 담당자가 확인한 웹 좌표 URL. https://www.ncloud-forums.com/topic/242/ */
export function naverPlaceWebUrl(lat: number, lng: number, name: string): string {
  const query = new URLSearchParams({
    lng: String(lng),
    lat: String(lat),
    title: name,
  });
  return `https://map.naver.com/?${query.toString()}`;
}

export function isMobileUserAgent(userAgent: string): boolean {
  return /iPhone|iPad|iPod|Android/i.test(userAgent);
}

export function isAndroidUserAgent(userAgent: string): boolean {
  return /Android/i.test(userAgent);
}

export function naverPlaceAppHref(
  lat: number,
  lng: number,
  name: string,
  userAgent: string,
  appname = DEFAULT_APP_NAME,
): string {
  const web = naverPlaceWebUrl(lat, lng, name);
  if (isAndroidUserAgent(userAgent)) {
    return naverPlaceAndroidIntent(lat, lng, name, web, appname);
  }
  return naverPlaceScheme(lat, lng, name, appname);
}

export function isNaverAppHref(href: string): boolean {
  return href.startsWith("nmap://") || href.startsWith("intent://");
}
