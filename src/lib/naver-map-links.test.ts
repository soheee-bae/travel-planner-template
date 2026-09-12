import { describe, expect, it } from "vitest";
import {
  isAndroidUserAgent,
  isMobileUserAgent,
  isNaverAppHref,
  naverPlaceAppHref,
  naverPlaceScheme,
  naverPlaceWebUrl,
} from "@/lib/naver-map-links";

describe("naver map links", () => {
  it("장소 스킴은 nmap://place 에 좌표와 인코딩된 이름을 넣는다", () => {
    const href = naverPlaceScheme(33.4974, 126.5126, "올래국수", "http://localhost:3000");
    expect(href).toBe(
      "nmap://place?lat=33.4974&lng=126.5126&name=%EC%98%AC%EB%9E%98%EA%B5%AD%EC%88%98&appname=http%3A%2F%2Flocalhost%3A3000",
    );
  });

  it("웹 URL은 NCP 확인 형식 lat/lng/title 이다", () => {
    expect(naverPlaceWebUrl(33.4974, 126.5126, "올래국수")).toBe(
      "https://map.naver.com/?lng=126.5126&lat=33.4974&title=%EC%98%AC%EB%9E%98%EA%B5%AD%EC%88%98",
    );
  });

  it("Android는 intent, iOS는 nmap, 데스크톱은 웹이 아니다(앱 href)", () => {
    const android = naverPlaceAppHref(
      33.5,
      126.5,
      "제주",
      "Mozilla/5.0 (Linux; Android 14)",
      "http://localhost:3000",
    );
    const ios = naverPlaceAppHref(
      33.5,
      126.5,
      "제주",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
      "http://localhost:3000",
    );
    expect(android.startsWith("intent://place?")).toBe(true);
    expect(android).toContain("package=com.nhn.android.nmap");
    expect(ios.startsWith("nmap://place?")).toBe(true);
    expect(isNaverAppHref(android)).toBe(true);
    expect(isNaverAppHref(ios)).toBe(true);
  });

  it("모바일 UA 판별", () => {
    expect(isMobileUserAgent("Mozilla/5.0 (Linux; Android 14)")).toBe(true);
    expect(isAndroidUserAgent("Mozilla/5.0 (Linux; Android 14)")).toBe(true);
    expect(isMobileUserAgent("Mozilla/5.0 (Macintosh)")).toBe(false);
  });
});
