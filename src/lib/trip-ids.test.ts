import { describe, expect, it } from "vitest";
import { JEJU_TRIP_SLUG, JEJU_TRIP_UUID, toClientTripId, toDbTripId } from "./trip-ids";

describe("trip-ids", () => {
  it("maps the jeju slug to the seeded uuid", () => {
    expect(toDbTripId(JEJU_TRIP_SLUG)).toBe(JEJU_TRIP_UUID);
    expect(toDbTripId(JEJU_TRIP_UUID)).toBe(JEJU_TRIP_UUID);
  });

  it("maps the seeded uuid back to the slug for app routes", () => {
    expect(toClientTripId(JEJU_TRIP_UUID)).toBe(JEJU_TRIP_SLUG);
    expect(toClientTripId("11111111-1111-1111-1111-111111111111")).toBe(
      "11111111-1111-1111-1111-111111111111",
    );
  });
});
