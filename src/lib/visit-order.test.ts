import { describe, expect, it } from "vitest";
import { nextOrderIndexForDay, placesOnDay, placesOnDayWithCoords, visitNumbers } from "@/lib/visit-order";
import type { Place } from "@/mocks/fixtures/places";

function place(partial: Partial<Place> & Pick<Place, "id" | "dayIndex" | "orderIndex">): Place {
  return {
    tripId: "t",
    name: partial.id,
    category: "관광",
    priority: "가능하면",
    tags: [],
    ...partial,
  };
}

describe("visitNumbers", () => {
  it("선택한 Day의 방문 순번을 1부터 매긴다", () => {
    const places = [
      place({ id: "a", dayIndex: 1, orderIndex: 2 }),
      place({ id: "b", dayIndex: 1, orderIndex: 0 }),
      place({ id: "c", dayIndex: 2, orderIndex: 0 }),
    ];
    const nums = visitNumbers(places, 1);
    expect(nums.get("b")).toBe(1);
    expect(nums.get("a")).toBe(2);
    expect(nums.has("c")).toBe(false);
  });

  it("placesOnDay는 그날 순서대로만 돌려준다", () => {
    const places = [
      place({ id: "a", dayIndex: 1, orderIndex: 2 }),
      place({ id: "b", dayIndex: 1, orderIndex: 0 }),
      place({ id: "c", dayIndex: 2, orderIndex: 0, lat: 33, lng: 126 }),
    ];
    expect(placesOnDay(places, 1).map((p) => p.id)).toEqual(["b", "a"]);
    expect(placesOnDayWithCoords(places, 2).map((p) => p.id)).toEqual(["c"]);
  });
});

describe("nextOrderIndexForDay", () => {
  it("그날 마지막 다음 값을 준다", () => {
    expect(
      nextOrderIndexForDay(
        [place({ id: "a", dayIndex: 1, orderIndex: 0 }), place({ id: "b", dayIndex: 1, orderIndex: 3 })],
        1,
      ),
    ).toBe(4);
  });
});
