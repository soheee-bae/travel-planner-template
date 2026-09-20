import { describe, expect, it } from "vitest";
import { calcNights, formatDateRange, formatDday, formatDdayCaption, formatDuration } from "@/lib/date";

describe("calcNights", () => {
  it("2박 3일을 2로 계산한다", () => {
    expect(calcNights("2026-09-15", "2026-09-17")).toBe(2);
  });

  it("당일치기는 0으로 계산한다", () => {
    expect(calcNights("2026-09-15", "2026-09-15")).toBe(0);
  });
});

describe("formatDuration", () => {
  it("2박 3일로 표기한다", () => {
    expect(formatDuration("2026-09-15", "2026-09-17")).toBe("2박 3일");
  });

  it("당일치기는 1일로 표기한다", () => {
    expect(formatDuration("2026-09-15", "2026-09-15")).toBe("1일");
  });
});

describe("formatDateRange", () => {
  it("9월 15일~9월 17일 형태로 표기한다", () => {
    expect(formatDateRange("2026-09-15", "2026-09-17")).toBe("9월 15일~9월 17일");
  });
});

describe("formatDday", () => {
  it("시작 전이면 D-n", () => {
    expect(formatDday("2026-09-15", "2026-09-17", "2026-09-04")).toBe("D-11");
  });

  it("출발일이면 D-Day", () => {
    expect(formatDday("2026-09-17", "2026-09-19", "2026-09-17")).toBe("D-Day");
  });

  it("여행 중이면 출발일 기준 D+n", () => {
    expect(formatDday("2026-09-17", "2026-09-19", "2026-09-18")).toBe("D+1");
    expect(formatDday("2026-09-17", "2026-09-19", "2026-09-19")).toBe("D+2");
  });

  it("종료 다음날부터 귀국일 기준 D+n", () => {
    expect(formatDday("2026-09-17", "2026-09-19", "2026-09-20")).toBe("D+1");
    expect(formatDday("2026-09-17", "2026-09-19", "2026-09-22")).toBe("D+3");
  });
});

describe("formatDdayCaption", () => {
  it("출발 전이면 비행기 뜨는 날까지", () => {
    expect(formatDdayCaption("2026-09-17", "2026-09-19", "2026-09-04")).toBe("비행기 뜨는 날까지");
  });

  it("종료 후면 다녀온 지", () => {
    expect(formatDdayCaption("2026-09-17", "2026-09-19", "2026-09-20")).toBe("다녀온 지");
  });
});
