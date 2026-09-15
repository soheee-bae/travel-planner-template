import type { ExpenseCategory } from "@/mocks/fixtures/expenses";
import type { PlaceCategory } from "@/mocks/fixtures/places";

export const ILLUSTRATION = {
  gift: "/illustrations/fab-gift.png",
  memo: "/illustrations/memo.png",
  splash: "/illustrations/loading-illustration.png",
  lock: "/illustrations/lock.png",
  hotel: "/illustrations/hotel.png",
  battery: "/illustrations/battery.png",
  tangerine: "/illustrations/한라봉.png",
  giftFab: {
    bg: "bg-[#FFF4EC] border border-[#F0D4C8]",
    shadow: "shadow-[0px_10px_28px_rgba(192,112,96,0.28)]",
  },
  weather: {
    맑음: "/illustrations/weather-sun.png",
    "구름 조금": "/illustrations/weather-partly.png",
    흐림: "/illustrations/weather-overcast.png",
    비: "/illustrations/weather-rain.png",
    눈: "/illustrations/weather-snow.png",
    소나기: "/illustrations/weather-shower.png",
    뇌우: "/illustrations/weather-thunder.png",
  },
} as const;

/** 시크릿 노트 노드. 잠금 해제 시 sortOrder별 아이콘. */
export const CAPSULE_UNLOCK_ICON: Record<number, string> = {
  1: "/illustrations/한라봉.png",
  2: "/illustrations/돌하르방.png",
  3: "/illustrations/cake.png",
  4: "/illustrations/fireworks.png",
  5: "/illustrations/rock.png",
};

export const PLACE_CATEGORY_ICON: Record<PlaceCategory, string> = {
  관광: "/illustrations/ocean.png",
  맛집: "/illustrations/cat-food.png",
  카페: "/illustrations/cat-cafee.png",
  자연: "/illustrations/nature.png",
  숙소: "/illustrations/cat-stay.png",
  교통: "/illustrations/cat-transport.png",
  공항: "/illustrations/airplane.png",
  쇼핑: "/illustrations/cat-shop.png",
  기타: "/illustrations/cat-etc.png",
};

export const EXPENSE_CATEGORY_ICON: Record<ExpenseCategory, string> = {
  식비: "/illustrations/cat-food.png",
  카페: "/illustrations/cat-cafee.png",
  "교통/주유": "/illustrations/cat-transport.png",
  항공: "/illustrations/airplane.png",
  숙소: "/illustrations/cat-stay.png",
  "쇼핑/선물": "/illustrations/cat-shop.png",
  "놀거리/입장권": "/illustrations/cat-sight.png",
  기타: "/illustrations/cat-etc.png",
};

/** 아이콘 실측 색의 연한 워시. iconBg는 그림 뒤, chip은 카테고리 태그. */
export type CategoryTone = {
  iconBg: string;
  chip: string;
};

export const PLACE_CATEGORY_TONE: Record<PlaceCategory, CategoryTone> = {
  관광: { iconBg: "bg-[#E8F1F6]", chip: "bg-[#D2E2EC]" },
  맛집: { iconBg: "bg-[#FFF1E6]", chip: "bg-[#F8DCC4]" },
  카페: { iconBg: "bg-[#F6EEE4]", chip: "bg-[#E8D4BC]" },
  자연: { iconBg: "bg-[#EEF6E4]", chip: "bg-[#D5E8C4]" },
  숙소: { iconBg: "bg-[#EEF3E6]", chip: "bg-[#DCE8CC]" },
  교통: { iconBg: "bg-[#FDEEE6]", chip: "bg-[#F6D4B8]" },
  공항: { iconBg: "bg-[#E8F0F8]", chip: "bg-[#D0DCEC]" },
  쇼핑: { iconBg: "bg-[#EEF1F6]", chip: "bg-[#D5DDEA]" },
  기타: { iconBg: "bg-[#F3EEE8]", chip: "bg-[#E5D8CC]" },
};

const TICKET_TONE: CategoryTone = { iconBg: "bg-[#FCE7E3]", chip: "bg-[#F0C8BC]" };

export const EXPENSE_CATEGORY_TONE: Record<ExpenseCategory, CategoryTone> = {
  식비: PLACE_CATEGORY_TONE.맛집,
  카페: PLACE_CATEGORY_TONE.카페,
  "교통/주유": PLACE_CATEGORY_TONE.교통,
  항공: PLACE_CATEGORY_TONE.공항,
  숙소: PLACE_CATEGORY_TONE.숙소,
  "쇼핑/선물": PLACE_CATEGORY_TONE.쇼핑,
  "놀거리/입장권": TICKET_TONE,
  기타: PLACE_CATEGORY_TONE.기타,
};

export const PREP_CATEGORY_ICON = {
  "맛집/카페": PLACE_CATEGORY_ICON.카페,
  관광: PLACE_CATEGORY_ICON.관광,
  "쇼핑/선물": PLACE_CATEGORY_ICON.쇼핑,
  기타: PLACE_CATEGORY_ICON.기타,
} as const;

export const MEMO_ICONS = [
  ILLUSTRATION.memo,
  PLACE_CATEGORY_ICON.맛집,
  PLACE_CATEGORY_ICON.카페,
  PLACE_CATEGORY_ICON.관광,
  PLACE_CATEGORY_ICON.숙소,
  PLACE_CATEGORY_ICON.교통,
  PLACE_CATEGORY_ICON.쇼핑,
  PLACE_CATEGORY_ICON.기타,
] as const;

export type MemoIcon = (typeof MEMO_ICONS)[number];

const LEGACY_MEMO_ICON: Record<string, MemoIcon> = {
  "📝": ILLUSTRATION.memo,
  "💡": ILLUSTRATION.memo,
  "🍜": PLACE_CATEGORY_ICON.맛집,
  "🍽️": PLACE_CATEGORY_ICON.맛집,
  "☕": PLACE_CATEGORY_ICON.카페,
  "📸": PLACE_CATEGORY_ICON.관광,
  "🏝️": PLACE_CATEGORY_ICON.관광,
  "🏛️": PLACE_CATEGORY_ICON.관광,
  "🏨": PLACE_CATEGORY_ICON.숙소,
  "🛏️": PLACE_CATEGORY_ICON.숙소,
  "🚗": PLACE_CATEGORY_ICON.교통,
  "🛒": PLACE_CATEGORY_ICON.쇼핑,
  "🛍️": PLACE_CATEGORY_ICON.쇼핑,
  "📌": PLACE_CATEGORY_ICON.기타,
  "📍": PLACE_CATEGORY_ICON.기타,
  "🎁": ILLUSTRATION.gift,
  "❤️": ILLUSTRATION.gift,
};

export function resolveMemoIcon(value: string): string {
  if (value.startsWith("/")) return value;
  return LEGACY_MEMO_ICON[value] ?? ILLUSTRATION.memo;
}

export function memoIconBg(src: string): string {
  if (src === ILLUSTRATION.memo) return "bg-[#EEECEB]";
  if (src === ILLUSTRATION.gift) return "bg-[#F6E4DE]";
  const match = (Object.entries(PLACE_CATEGORY_ICON) as [PlaceCategory, string][]).find(
    ([, path]) => path === src,
  );
  return match ? PLACE_CATEGORY_TONE[match[0]].iconBg : "bg-[#F6EEE4]";
}
