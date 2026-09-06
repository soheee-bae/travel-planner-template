import { describe, expect, it } from "vitest";
import { adjacentCoordPairs } from "@/features/planner/hooks";
import type { Place } from "@/mocks/fixtures/places";

function place(partial: Partial<Place> & Pick<Place, "id">): Place {
  return {
    tripId: "t",
    name: partial.id,
    category: "관광",
    priority: "가능하면",
    dayIndex: 1,
    orderIndex: 0,
    tags: [],
    ...partial,
  };
}

describe("adjacentCoordPairs", () => {
  it("좌표 있는 연속 쌍만 만든다", () => {
    const pairs = adjacentCoordPairs([
      place({ id: "a", lat: 37.5, lng: 127 }),
      place({ id: "b" }),
      place({ id: "c", lat: 37.6, lng: 127.1 }),
      place({ id: "d", lat: 37.7, lng: 127.2 }),
    ]);
    expect(pairs).toEqual([{ start: { lat: 37.6, lng: 127.1 }, end: { lat: 37.7, lng: 127.2 } }]);
  });
});
