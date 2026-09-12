import { test, expect } from "@playwright/test";

test("나고야 여행 상세에 6탭이 보이고 개요 탭에 숙소·교통편이 보인다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya");
  await expect(page.getByRole("heading", { level: 1, name: /나고야 여행 플래너/ })).toBeVisible();

  const tablist = page.getByRole("tablist", { name: "여행 상세 탭" });
  await expect(tablist).toBeVisible();
  for (const label of ["홈", "플래너", "스팟", "영수증", "할거리"]) {
    await expect(tablist.getByRole("tab", { name: label })).toBeVisible();
  }

  await expect(page.getByText("호텔 악텔 나고야 니시키")).toBeVisible();
  await expect(page.getByText(/인천.*나고야/)).toBeVisible();
});

test("탭을 전환하면 URL이 ?tab= 으로 바뀌고 해당 콘텐츠가 보인다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya");
  await page.getByRole("tablist", { name: "여행 상세 탭" }).getByRole("tab", { name: "할거리" }).click();
  await expect(page).toHaveURL(/\?tab=prep/);
  await expect(page.getByText("끄적끄적")).toBeVisible();

  await page.locator("#trip-tab-overview").evaluate((el: HTMLElement) => el.click());
  await expect(page).not.toHaveURL(/\?tab=/);
});

test("숙소 추가 다이얼로그로 숙소를 추가하면 즉시 목록에 반영된다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya");
  await page.getByRole("button", { name: "숙소 추가" }).click();
  await page.getByLabel("숙소명").fill("테스트 게스트하우스");
  await page.getByRole("button", { name: "다음 달" }).click();
  await page.getByRole("button", { name: "다음 달" }).click();
  const calendar = page.getByRole("grid", { name: "날짜 범위 선택" });
  await calendar.getByRole("button", { name: "6", exact: true }).click();
  await calendar.getByRole("button", { name: "8", exact: true }).click();
  await page.getByRole("button", { name: "추가" }).click();

  await expect(page.getByText("테스트 게스트하우스")).toBeVisible();
});
