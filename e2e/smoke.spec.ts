import { test, expect } from "@playwright/test";

test("/ 은 제주 여행 상세로 리다이렉트된다", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/trips\/trip_jeju$/);
});

test("홈에 D-Day, 항공 티켓, 숙소가 보인다", async ({ page }) => {
  await page.goto("/trips");
  await expect(page).toHaveURL(/\/trips\/trip_jeju$/);
  await expect(page.getByRole("heading", { level: 1, name: /소희랑 준형이랑 귤 까먹으러/ })).toBeVisible();
  await expect(page.getByText(/비행기 뜨는 날까지|출발일|여행 중|다녀온 지/)).toBeVisible();
  await expect(page.getByText("출발편")).toBeVisible();
  await expect(page.getByText("GMP")).toBeVisible();
  await expect(page.getByText("CJU")).toBeVisible();
  await expect(page.getByText("제주 파라다이스 호텔")).toBeVisible();
  await expect(page.getByText(/최저 \/ 최고/)).toBeVisible();
});
