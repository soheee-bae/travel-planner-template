import { test, expect } from "@playwright/test";

test("리스트 탭에 카테고리 필터와 나고야 시드 장소 4건이 보인다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=places");
  await expect(page.getByText("지브리 파크")).toBeVisible();
  await expect(page.getByText("아츠타 호라이켄 마츠자카야점")).toBeVisible();
  await expect(page.getByText("도요타 박물관")).toBeVisible();

  const filterBar = page.getByRole("tablist", { name: "카테고리 필터" });
  await filterBar.getByRole("tab", { name: /관광/ }).click();
  await expect(page.getByText("지브리 파크")).toBeVisible();
  await expect(page.getByText("아츠타 호라이켄 마츠자카야점")).not.toBeVisible();
});

test("장소를 추가하면 즉시 리스트에 나타난다", async ({ page }) => {
  await page.route("**/api/geocode**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ lat: 35.185, lng: 136.9 }),
    });
  });
  await page.goto("/trips/trip_nagoya?tab=places");
  await page.getByRole("button", { name: "여기 가볼까?" }).click();
  await expect(page.getByText("자세히 입력")).toHaveCount(0);
  await expect(page.getByText("지도 링크")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "찾기" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "숙소" })).toBeVisible();
  await page.getByLabel("장소 이름").fill("나고야성");
  await page.getByLabel("주소").fill("나고야시 나카구");
  await page.getByLabel("예상 소요 시간 (선택)").fill("1시간 30분");
  await page.getByRole("button", { name: "지도에 담기" }).click();
  await expect(page.getByText("나고야성")).toBeVisible();
});

test("선택 모드에서 취소와 삭제만 보인다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=places");
  await page.getByRole("button", { name: "선택", exact: true }).click();
  await page.getByRole("checkbox", { name: "도요타 박물관 선택" }).check();
  await expect(page.getByText("1개 선택됨")).toBeVisible();
  await expect(page.getByRole("button", { name: "선택", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "취소", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "삭제", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Day/ })).toHaveCount(0);
  await page.getByRole("button", { name: "취소", exact: true }).click();
  await expect(page.getByRole("button", { name: "선택", exact: true })).toBeVisible();
  await expect(page.getByText("1개 선택됨")).toHaveCount(0);
});

test("같은 이름·주소·카테고리는 스팟 목록에서 한 줄로 합치고 일정 카드는 Day별로 남긴다", async ({ page }) => {
  await page.route("**/api/geocode**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ lat: 35.185, lng: 136.9 }),
    });
  });

  async function addHotel(dayLabel: string) {
    await page.getByRole("button", { name: "여기 가볼까?" }).click();
    await page.getByLabel("장소 이름").fill("호텔 시리우스");
    await page.getByLabel("주소").fill("제주시");
    await page.getByRole("button", { name: "숙소" }).click();
    await page.getByRole("group", { name: "일차" }).getByRole("button", { name: dayLabel, exact: true }).click();
    await page.getByRole("button", { name: "지도에 담기" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }

  await page.goto("/trips/trip_nagoya?tab=places");
  await addHotel("Day 1");
  await addHotel("Day 2");

  await expect(page.getByText("호텔 시리우스")).toHaveCount(1);
  await expect(page.getByText("Day 1 · Day 2")).toBeVisible();

  await page.getByRole("tablist", { name: "여행 상세 탭" }).getByRole("tab", { name: "플래너" }).click();
  await expect(page.getByRole("tab", { name: "Day 1" })).toBeVisible();
  await expect(page.getByText("호텔 시리우스")).toBeVisible();
  await page.getByRole("tab", { name: "Day 2" }).click();
  await expect(page.getByText("호텔 시리우스")).toBeVisible();
});

test("선택 모드로 여러 장소를 한 번에 삭제할 수 있다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=places");
  await page.getByRole("button", { name: "선택", exact: true }).click();
  await page.getByRole("checkbox", { name: "도요타 박물관 선택" }).check();
  await expect(page.getByText("1개 선택됨")).toBeVisible();

  await page.getByRole("button", { name: "삭제" }).click();
  await expect(page.getByText("이 항목을 정말 지울까?")).toBeVisible();
  await page.getByRole("button", { name: "과감하게 삭제" }).click();
  await expect(page.getByText("도요타 박물관")).not.toBeVisible();
});
