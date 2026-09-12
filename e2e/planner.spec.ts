import { test, expect } from "@playwright/test";

test("플래너 탭은 Day 1이 기본으로 활성화되고 해당 일정이 보인다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=planner");
  await expect(page.getByRole("tab", { name: "Day 1" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("아츠타 호라이켄 마츠자카야점")).toBeVisible();
});

test("Day 2로 전환하면 순서대로 장소가 보이고 이동시간 pill이 표시된다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=planner");
  await page.getByRole("tab", { name: "Day 2" }).click();

  const list = page.locator("text=코메다 커피 사카에 니시키 3초메점");
  await expect(list).toBeVisible();
  await expect(page.getByText("지브리 파크")).toBeVisible();
  await expect(page.getByText(/🚶 \d+분|🚗 \d+분|🚗 \d+시간|🚶 \d+시간/)).toBeVisible();
});

test("선택 모드에서 장소를 Day에 배정할 수 있다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=planner");
  await page.getByRole("button", { name: "선택", exact: true }).click();
  await expect(page.getByRole("button", { name: "취소", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "선택", exact: true })).toHaveCount(0);
  await page.getByRole("checkbox", { name: "도요타 박물관 선택" }).check();
  await page.getByRole("button", { name: "선택한 장소를 Day 1에 추가" }).click();
  await page.getByRole("tab", { name: "Day 1" }).click();
  await expect(page.getByText("도요타 박물관")).toBeVisible();
});

test("Day 2 안에서 카드를 드래그해 순서를 바꿀 수 있다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=planner");
  await page.getByRole("tab", { name: "Day 2" }).click();

  const cards = page.locator('[aria-label$="순서 변경 (드래그)"]');
  await expect(cards).toHaveCount(2);

  const first = cards.nth(0);
  const second = cards.nth(1);

  const firstBox = (await first.boundingBox())!;
  const secondBox = (await second.boundingBox())!;

  const startX = firstBox.x + firstBox.width / 2;
  const startY = firstBox.y + firstBox.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX, startY + 15, { steps: 5 });
  await page.waitForTimeout(50);
  await page.mouse.move(startX, secondBox.y + secondBox.height + 20, { steps: 15 });
  await page.waitForTimeout(150);
  await page.mouse.up();
  await page.waitForTimeout(150);

  const listText = await page.locator('[role="tabpanel"]').last().innerText();
  const ghibliIndex = listText.indexOf("지브리 파크");
  const komedaIndex = listText.indexOf("코메다 커피");
  expect(ghibliIndex).toBeGreaterThan(-1);
  expect(komedaIndex).toBeGreaterThan(-1);
  expect(ghibliIndex).toBeLessThan(komedaIndex);
});
