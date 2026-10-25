import { test, expect } from "@playwright/test";

test("타임캡슐 FAB를 누르면 여정이 열린다", async ({ page }) => {
  await page.goto("/trips/trip_jeju");
  await page.getByRole("button", { name: "타임캡슐 열기" }).click();
  await expect(page.getByRole("heading", { name: "시크릿 노트" })).toBeVisible();
  await page.getByRole("button", { name: "닫기" }).click();
  await expect(page.getByRole("heading", { name: "시크릿 노트" })).toHaveCount(0);
});
