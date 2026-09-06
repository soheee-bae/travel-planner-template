import { test, expect } from "@playwright/test";

test("/ 은 제주 여행 상세로 리다이렉트된다", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/trips\/trip_jeju$/);
});

test("홈에 귤 캐릭터, D-Day, 항공 티켓이 보인다", async ({ page }) => {
  await page.goto("/trips");
  await expect(page).toHaveURL(/\/trips\/trip_jeju$/);
  await expect(page.getByRole("heading", { level: 1, name: /귤귤 커플의 제주 여행/ })).toBeVisible();
  await expect(page.getByRole("img", { name: "귤 캐릭터" })).toBeVisible();
  await expect(page.getByText("남자친구 생일 기념").first()).toBeVisible();
  await expect(page.getByText("비행기 티켓")).toBeVisible();
  await expect(page.getByText("김포", { exact: true })).toBeVisible();
  await expect(page.getByText("제주", { exact: true }).first()).toBeVisible();
});
