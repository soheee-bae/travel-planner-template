import { describe, expect, it } from "vitest";
import { toClientTripId, toDbTripId } from "./trip-ids";

describe("trip-ids", () => {
  it("데이터베이스 id를 그대로 왕복한다", () => {
    const id = "11111111-1111-1111-1111-111111111111";
    expect(toDbTripId(id)).toBe(id);
    expect(toClientTripId(id)).toBe(id);
  });
});
