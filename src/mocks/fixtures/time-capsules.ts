import { z } from "zod";

export const timeCapsuleSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  sortOrder: z.number().int().min(1),
  unlockAt: z.string(),
  title: z.string().min(1),
  summary: z.string().min(1),
  lockedToast: z.string().min(1),
  popupTitle: z.string().min(1),
  popupText: z.string().min(1),
  imgSrc: z.string().min(1),
  playsConfetti: z.boolean(),
});
export type TimeCapsule = z.infer<typeof timeCapsuleSchema>;

const COPY = [
  {
    sortOrder: 1,
    title: "설레는 출발 ✈️",
    summary: "탑승구 앞에서 열어봐!",
    popupTitle: "출발 1시간 전!",
    popupText:
      "이번 제주도 여행의 전속 가이드, 배소희 인사드립니다! (꾸벅) VVIP 준형 고객님, 탑승 준비되셨나요? ✈️ 첫 번째 투어 미션: 비행기 이륙 전 가이드랑 세상에서 제일 신난 표정으로 예쁘게 셀카 1장 찍기! 📸 자, 그럼 만족도 200% 보장 ‘소희 투어’ 지금 바로 출발합니다아~ 🍊 꽉 잡으십쇼!",
    imgSrc: "/assets/duck-airport.svg",
    playsConfetti: false,
  },
  {
    sortOrder: 2,
    title: "둘째 날 점심 🍽️",
    summary: "맛있는 점심 먹으면서 열어봐!",
    popupTitle: "든든하게 먹고 놀자",
    popupText:
      "어제 일정 소화하느라 고생했어! 오늘 밥도 꿀맛이지? 다 먹고 오후 일정도 신나게 달려보자구 🐷",
    imgSrc: "/assets/duck-lunch.svg",
    playsConfetti: false,
  },
  {
    sortOrder: 3,
    title: "생일 파티 타임 🎂",
    summary: "케이크에 불 붙이고 열어봐!",
    popupTitle: "미리 해피 벌스데이!",
    popupText:
      "서프라이즈! 🎉 소희 가이드가 준비한 선물 교환권입니다. 지금 바로 뽀뽀 3번 해주시면 실물 '버즈 케이스'와 '손편지'로 교환해 드립니다 🎁",
    imgSrc: "/assets/duck-gift.svg",
    playsConfetti: true,
  },
  {
    sortOrder: 4,
    title: "진짜 생일 당일! 🎉",
    summary: "준형아 생일 축하해!",
    popupTitle: "태어나줘서 고마워",
    popupText:
      "드디어 진짜 생일 당일! 네가 있어서 이번 제주도 여행이 훨씬 더 빛나고 행복해. 오늘 하루도 최고로 만들어줄게 💖",
    imgSrc: "/assets/duck-party.svg",
    playsConfetti: false,
  },
  {
    sortOrder: 5,
    title: "아쉬운 귀국길 🌙",
    summary: "비행기 타기 전 마지막 편지",
    popupTitle: "우리의 다음 여행은?",
    popupText:
      "시간 진짜 빠르다 ㅠㅠ 이번 여행 내내 나 챙겨주고 운전하느라 너무 고생 많았어! 우리 다음엔 어디로 놀러 갈까? 사랑해 🥰",
    imgSrc: "/assets/duck-home.svg",
    playsConfetti: false,
  },
] as const;

/** mock trip_jeju 날짜(2026-09-17~19)에 맞춘 언락 시각. */
const MOCK_UNLOCK_AT = [
  "2026-09-17T15:00:00+09:00",
  "2026-09-18T12:00:00+09:00",
  "2026-09-18T18:00:00+09:00",
  "2026-09-19T12:00:00+09:00",
  "2026-09-19T20:00:00+09:00",
] as const;

const MOCK_LOCKED_TOAST = [
  "이 메시지는 9월 17일 오후 3시에 열려!",
  "이 메시지는 9월 18일 낮 12시에 열려!",
  "이 메시지는 9월 18일 저녁 6시에 열려!",
  "이 메시지는 9월 19일 낮 12시에 열려!",
  "이 메시지는 9월 19일 저녁 8시에 열려!",
] as const;

export const initialTimeCapsules: TimeCapsule[] = COPY.map((item, index) => ({
  id: `capsule_jeju_${item.sortOrder}`,
  tripId: "trip_jeju",
  sortOrder: item.sortOrder,
  unlockAt: MOCK_UNLOCK_AT[index],
  title: item.title,
  summary: item.summary,
  lockedToast: MOCK_LOCKED_TOAST[index],
  popupTitle: item.popupTitle,
  popupText: item.popupText,
  imgSrc: item.imgSrc,
  playsConfetti: item.playsConfetti,
}));

/** 아이콘 확인용. 여행 전에 false로 되돌린다. */
export const PREVIEW_UNLOCK_ALL_CAPSULES = true;

export function isUnlockTimeReached(unlockAt: string, nowMs = Date.now()): boolean {
  const at = new Date(unlockAt).getTime();
  return Number.isFinite(at) && nowMs >= at;
}

export function isCapsuleUnlocked(unlockAt: string, nowMs = Date.now()): boolean {
  return PREVIEW_UNLOCK_ALL_CAPSULES || isUnlockTimeReached(unlockAt, nowMs);
}

export function capsulePopupView(item: TimeCapsule): { title: string; text: string; cta: string } {
  const copy = COPY.find((entry) => entry.sortOrder === item.sortOrder);
  if (item.sortOrder === 1) {
    return {
      title: copy?.popupTitle ?? item.popupTitle,
      text: copy?.popupText ?? item.popupText,
      cta: "확인 완료!",
    };
  }
  return { title: item.popupTitle, text: item.popupText, cta: "닫기" };
}
