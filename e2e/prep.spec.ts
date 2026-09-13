import { test, expect } from "@playwright/test";

test("준비 탭에 카테고리 태그와 프로그레스 바가 보인다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=prep");
  await expect(page.getByRole("heading", { name: "제주에서 슬쩍 하고 싶은 것들" })).toBeVisible();
  const filters = page.getByRole("tablist", { name: "카테고리 필터" });
  await expect(filters.getByRole("tab", { name: "전체" })).toBeVisible();
  await expect(filters.getByRole("tab", { name: "맛집/카페" })).toBeVisible();
  await expect(filters.getByRole("tab", { name: "관광" })).toBeVisible();
  await expect(filters.getByRole("tab", { name: "쇼핑/선물" })).toBeVisible();
  await expect(filters.getByRole("tab", { name: "기타" })).toBeVisible();
  await expect(page.getByRole("progressbar")).toBeVisible();
});

test("항목을 체크하면 프로그레스가 즉시 바뀐다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=prep");
  const checkbox = page.getByRole("checkbox", { name: "렌터카 예약 완료" });
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await expect(page.getByText(/3\/19/)).toBeVisible();
});

test("항목 추가 모달은 선택된 카테고리를 기본값으로 연다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=prep");
  await page.getByRole("tab", { name: "관광" }).click();
  await page.getByRole("button", { name: "슬쩍 추가하기" }).click();
  await expect(page.getByRole("dialog").getByRole("button", { name: /관광/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
