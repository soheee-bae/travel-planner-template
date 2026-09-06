import { describe, expect, it } from "vitest";
import { calcNights, formatDateRange, formatDday, formatDuration } from "@/lib/date";

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
});
