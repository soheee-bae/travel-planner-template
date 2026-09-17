import { describe, expect, it } from "vitest";
import { assignedDaysOf, nextOrderIndexForDay, placesOnDay, placesOnDayWithCoords, groupedSpots, uniqueMapPlaces, visitNumbers } from "@/lib/visit-order";
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

describe("uniqueMapPlaces", () => {
  it("이름·주소·카테고리가 같으면 핀을 하나로 합치고 그날 일정을 우선한다", () => {
    const places = [
      place({
        id: "in",
        name: "호텔 시리우스",
        address: "제주시",
        category: "숙소",
        dayIndex: 1,
        orderIndex: 4,
        lat: 33.5,
        lng: 126.5,
      }),
      place({
        id: "out",
        name: "호텔 시리우스",
        address: "제주시",
        category: "숙소",
        dayIndex: 2,
        orderIndex: 0,
        lat: 33.5,
        lng: 126.5,
      }),
    ];
    expect(uniqueMapPlaces(places, 1).dayPlaces.map((p) => p.id)).toEqual(["in"]);
    expect(uniqueMapPlaces(places, 1).otherPlaces).toEqual([]);
    expect(uniqueMapPlaces(places, 2).dayPlaces.map((p) => p.id)).toEqual(["out"]);
    expect(uniqueMapPlaces(places, 3).otherPlaces.map((p) => p.id)).toEqual(["in"]);
  });

  it("스팟 목록은 이름·주소·카테고리가 같으면 한 줄로 묶는다", () => {
    const places = [
      place({
        id: "in",
        name: "호텔 시리우스",
        address: "제주시",
        category: "숙소",
        dayIndex: 1,
        orderIndex: 4,
      }),
      place({
        id: "out",
        name: "호텔 시리우스",
        address: "제주시",
        category: "숙소",
        dayIndex: 2,
        orderIndex: 0,
      }),
    ];
    const groups = groupedSpots(places);
    expect(groups).toHaveLength(1);
    expect(groups[0].members.map((p) => p.id)).toEqual(["in", "out"]);
    expect(assignedDaysOf(groups[0].members)).toEqual([1, 2]);
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
