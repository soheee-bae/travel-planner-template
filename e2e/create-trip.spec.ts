import { test, expect } from "@playwright/test";

test("여행 수정으로 제목을 바꾸면 헤더에 반영된다", async ({ page }) => {
  await page.goto("/trips/trip_jeju");
  await page.getByRole("button", { name: "여행 편집" }).click();
  await page.getByLabel("여행 이름").fill("생일 제주");
  await page.getByRole("button", { name: "저장" }).click();
  await expect(page.getByRole("heading", { level: 1, name: /생일 제주/ })).toBeVisible();
});
