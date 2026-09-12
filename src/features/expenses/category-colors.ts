import type { ExpenseCategory } from "@/mocks/fixtures/expenses";

/**
 * DESIGN.md 카테고리 팔레트(§색상 토큰)의 실측 hex를 그대로 재사용한다.
 * Recharts의 Pie `fill`은 CSS 커스텀 프로퍼티보다 리터럴 hex가 더 안전하다.
 */
export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  식비: "#F29C9F",
  카페: "#F3C65B",
  "교통/주유": "#F09040",
  숙소: "#8CB9D2",
  "쇼핑/선물": "#C2568F",
  놀거리: "#7AB87A",
  기타: "#9E8FD0",
};
