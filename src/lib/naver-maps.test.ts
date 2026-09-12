import { describe, expect, it } from "vitest";
import { parseNaverDriving, parseNaverGeocode } from "@/lib/naver-maps";
import { drivingSummaryToLeg, estimateWalkLeg, legCacheKey, resolveDisplayedLeg, roundCoord } from "@/lib/travel-leg";

describe("parseNaverGeocode", () => {
  it("x/y를 lng/lat로 바꾼다", () => {
    const result = parseNaverGeocode({
      status: "OK",
      addresses: [
        {
          x: "126.9780",
          y: "37.5665",
          roadAddress: "서울특별시 중구",
        },
      ],
    });
    expect(result).toEqual({
      lat: 37.5665,
      lng: 126.978,
      displayName: "서울특별시 중구",
    });
  });

  it("주소가 없으면 null", () => {
    expect(parseNaverGeocode({ status: "OK", addresses: [] })).toBeNull();
  });
});

describe("parseNaverDriving", () => {
  it("duration 밀리초를 분으로 바꾼다", () => {
    const result = parseNaverDriving({
      code: 0,
      route: {
        traoptimal: [{ summary: { distance: 1200, duration: 180_000 } }],
      },
    });
    expect(result).toEqual({
      durationMin: 3,
      distanceM: 1200,
      source: "naver",
      mode: "car",
    });
  });

  it("code가 0이 아니면 null", () => {
    expect(parseNaverDriving({ code: 1, route: {} })).toBeNull();
  });
});

describe("travel-leg", () => {
  it("같은 좌표 캐시 키는 반올림 후 같다", () => {
    expect(legCacheKey({ lat: 37.56651, lng: 126.97804 }, { lat: 37.5, lng: 127 })).toBe(
      legCacheKey({ lat: 37.566509, lng: 126.978041 }, { lat: 37.5, lng: 127 }),
    );
  });

  it("roundCoord는 소수 5자리", () => {
    expect(roundCoord(37.566549)).toBe(37.56655);
  });

  it("도보 추정은 estimate/walk", () => {
    const leg = estimateWalkLeg({ lat: 37.55, lng: 126.97 }, { lat: 37.56, lng: 126.98 });
    expect(leg.source).toBe("estimate");
    expect(leg.mode).toBe("walk");
    expect(leg.durationMin).toBeGreaterThan(0);
  });

  it("자차 변환은 최소 1분", () => {
    expect(drivingSummaryToLeg(10, 1000).durationMin).toBe(1);
  });

  it("자차가 5분 이하면 네이버 거리로 도보를 보여준다", () => {
    const car = drivingSummaryToLeg(400, 180_000);
    expect(car.durationMin).toBe(3);
    const shown = resolveDisplayedLeg(car, { lat: 37.55, lng: 126.97 }, { lat: 37.56, lng: 126.98 });
    expect(shown.mode).toBe("walk");
    expect(shown.source).toBe("naver");
    expect(shown.distanceM).toBe(400);
  });

  it("자차가 5분을 넘으면 차를 보여준다", () => {
    const car = drivingSummaryToLeg(3200, 420_000);
    expect(car.durationMin).toBe(7);
    const shown = resolveDisplayedLeg(car, { lat: 33.5, lng: 126.5 }, { lat: 33.51, lng: 126.52 });
    expect(shown).toEqual(car);
  });
});
