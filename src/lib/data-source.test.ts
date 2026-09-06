import { describe, expect, it } from "vitest";
import { isMockData } from "@/lib/data-source";

describe("isMockData", () => {
  it("테스트 환경에서는 항상 mock이다", () => {
    expect(process.env.NODE_ENV).toBe("test");
    expect(isMockData()).toBe(true);
  });
});
