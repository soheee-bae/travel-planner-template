import { test, expect } from "@playwright/test";

test("/ 은 여행 목록으로 간다", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/trips$/);
  await expect(page.getByRole("heading", { name: /나의 여행/ })).toBeVisible();
});

test("홈에 D-Day, 항공 티켓, 숙소가 보인다", async ({ page }) => {
  await page.goto("/trips/trip_jeju");
  await expect(page.getByRole("heading", { level: 1, name: /주말 여행/ })).toBeVisible();
  await expect(page.getByText(/비행기 뜨는 날까지|출발일|여행 중|다녀온 지/)).toBeVisible();
  await expect(page.getByText("출발편")).toBeVisible();
  await expect(page.getByText("GMP")).toBeVisible();
  await expect(page.getByText("CJU")).toBeVisible();
  await expect(page.getByText("제주 파라다이스 호텔")).toBeVisible();
  await expect(page.getByText(/최저 \/ 최고/)).toBeVisible();
});
