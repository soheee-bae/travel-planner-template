import { describe, expect, it } from "vitest";
import { formatDurationText, parseDurationText } from "@/lib/duration-text";

describe("parseDurationText", () => {
  it("빈 값은 undefined", () => {
    expect(parseDurationText(undefined)).toBeUndefined();
    expect(parseDurationText("")).toBeUndefined();
    expect(parseDurationText("   ")).toBeUndefined();
  });

  it("숫자만 있으면 분으로 본다", () => {
    expect(parseDurationText("90")).toBe(90);
    expect(parseDurationText("0")).toBeUndefined();
  });

  it("한국어 시간 표기를 분으로 바꾼다", () => {
    expect(parseDurationText("1시간 30분")).toBe(90);
    expect(parseDurationText("1시간30분")).toBe(90);
    expect(parseDurationText("2시간")).toBe(120);
    expect(parseDurationText("45분")).toBe(45);
  });

  it("영문 표기와 1:30 형식도 받는다", () => {
    expect(parseDurationText("1h 30m")).toBe(90);
    expect(parseDurationText("1:30")).toBe(90);
    expect(parseDurationText("90m")).toBe(90);
  });

  it("해석 불가면 undefined", () => {
    expect(parseDurationText("오래")).toBeUndefined();
    expect(parseDurationText("abc")).toBeUndefined();
  });
});

describe("formatDurationText", () => {
  it("분을 한국어로 되돌린다", () => {
    expect(formatDurationText(90)).toBe("1시간 30분");
    expect(formatDurationText(120)).toBe("2시간");
    expect(formatDurationText(45)).toBe("45분");
    expect(formatDurationText(undefined)).toBe("");
  });
});
