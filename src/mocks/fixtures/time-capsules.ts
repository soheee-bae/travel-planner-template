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
      "이번 제주도 여행의 전속 가이드,<br><b>배소희</b> 인사드립니다! (꾸벅)<br><br><b>VVIP 준형</b> 고객님, 탑승 준비되셨나요? ✈️<br><br>첫 번째 투어 미션:<br>비행기 이륙 전 가이드랑<br>세상에서 제일 신난 표정으로 예쁘게 셀카 1장 찍기! 📸<br><br>자, 그럼 만족도 200% 보장 <b>소희 투어</b>,<br>지금 바로 출발합니다아~ 🍊<br>꽉 잡으십쇼!",
    imgSrc: "/assets/duck-airport.svg",
    playsConfetti: false,
  },
  {
    sortOrder: 2,
    title: "둘째 날 점심 🍽️",
    summary: "맛있는 점심 먹으면서 열어봐!",
    popupTitle: "든든하게 먹고 놀자",
    popupText:
      "어제 일정 소화하느라 고생했어!<br><br>오늘 밥도 꿀맛이지? 🐷<br><br>다 먹고 오후 일정도<br>신나게 달려보자구!",
    imgSrc: "/assets/duck-lunch.svg",
    playsConfetti: false,
  },
  {
    sortOrder: 3,
    title: "생일 파티 타임 🎂",
    summary: "케이크에 불 붙이고 열어봐!",
    popupTitle: "미리 해피 벌스데이!",
    popupText:
      "<b>서프라이즈!</b> 🎉<br><br>소희 가이드가 준비한<br><b>선물 교환권</b>입니다.<br><br>지금 바로 뽀뽀 3번 해주시면<br>실물 <b>버즈 케이스</b>와 <b>손편지</b>로<br>교환해 드립니다 🎁",
    imgSrc: "/assets/duck-gift.svg",
    playsConfetti: true,
  },
  {
    sortOrder: 4,
    title: "진짜 생일 당일! 🎉",
    summary: "준형아 생일 축하해!",
    popupTitle: "태어나줘서 고마워",
    popupText:
      "드디어 <b>진짜 생일 당일!</b><br><br>네가 있어서 이번 제주도 여행이<br>훨씬 더 빛나고 행복해.<br><br>오늘 하루도 최고로 만들어줄게 💖",
    imgSrc: "/assets/duck-party.svg",
    playsConfetti: false,
  },
  {
    sortOrder: 5,
    title: "아쉬운 귀국길 🌙",
    summary: "비행기 타기 전 마지막 편지",
    popupTitle: "우리의 다음 여행은?",
    popupText:
      "시간 진짜 빠르다 ㅠㅠ<br><br>이번 여행 내내 나 챙겨주고<br>운전하느라 너무 고생 많았어!<br><br>우리 다음엔 어디로 놀러 갈까?<br><br><b>사랑해</b> 🥰",
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

/** 아이콘 확인용. true면 unlockAt을 무시하고 전부 연다. */
export const PREVIEW_UNLOCK_ALL_CAPSULES = false;

export function isUnlockTimeReached(unlockAt: string, nowMs = Date.now()): boolean {
  const at = new Date(unlockAt).getTime();
  return Number.isFinite(at) && nowMs >= at;
}

export function isCapsuleUnlocked(unlockAt: string, nowMs = Date.now()): boolean {
  return PREVIEW_UNLOCK_ALL_CAPSULES || isUnlockTimeReached(unlockAt, nowMs);
}

export function capsulePopupView(item: TimeCapsule): { title: string; text: string; cta: string } {
  return {
    title: item.popupTitle,
    text: item.popupText,
    cta: item.sortOrder === 1 ? "확인 완료!" : "닫기",
  };
}

/** DB 리치텍스트/줄바꿈을 화면에 맞게 정규화한다. 허용 태그만 남긴다. */
const CAPSULE_RICH_TAGS = ["b", "strong", "em", "i", "u", "p"] as const;
type CapsuleRichTag = (typeof CAPSULE_RICH_TAGS)[number];

export type CapsuleRichNode =
  | { type: "text"; value: string }
  | { type: "br" }
  | { type: "element"; tag: CapsuleRichTag; children: CapsuleRichNode[] };

const CAPSULE_RICH_TAG_SET = new Set<string>([...CAPSULE_RICH_TAGS, "br"]);

function decodeCapsuleEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function isCapsuleRichTag(tag: string): tag is CapsuleRichTag {
  return (CAPSULE_RICH_TAGS as readonly string[]).includes(tag);
}

function pushCapsuleText(nodes: CapsuleRichNode[], raw: string) {
  const value = decodeCapsuleEntities(raw);
  if (!value) return;
  const last = nodes[nodes.length - 1];
  if (last?.type === "text") {
    last.value += value;
    return;
  }
  nodes.push({ type: "text", value });
}

export function parseCapsuleRichText(raw: string): CapsuleRichNode[] {
  const source = raw.replace(/\r\n?/g, "\n");
  type Frame = { tag: CapsuleRichTag | "root"; children: CapsuleRichNode[] };
  const stack: Frame[] = [{ tag: "root", children: [] }];
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  let cursor = 0;
  let match: RegExpExecArray | null = tagRe.exec(source);

  while (match) {
    if (match.index > cursor) {
      pushCapsuleText(stack[stack.length - 1].children, source.slice(cursor, match.index));
    }
    cursor = tagRe.lastIndex;
    const tagName = match[1].toLowerCase();
    const isClose = match[0][1] === "/";
    if (!CAPSULE_RICH_TAG_SET.has(tagName)) {
      match = tagRe.exec(source);
      continue;
    }
    if (tagName === "br") {
      if (!isClose) stack[stack.length - 1].children.push({ type: "br" });
      match = tagRe.exec(source);
      continue;
    }
    if (!isCapsuleRichTag(tagName)) {
      match = tagRe.exec(source);
      continue;
    }
    if (isClose) {
      for (let index = stack.length - 1; index > 0; index -= 1) {
        if (stack[index].tag === tagName) {
          while (stack.length - 1 > index) {
            const extra = stack.pop();
            if (!extra || extra.tag === "root") break;
            stack[stack.length - 1].children.push({
              type: "element",
              tag: extra.tag,
              children: extra.children,
            });
          }
          const frame = stack.pop();
          if (frame && frame.tag !== "root") {
            stack[stack.length - 1].children.push({
              type: "element",
              tag: frame.tag,
              children: frame.children,
            });
          }
          break;
        }
      }
      match = tagRe.exec(source);
      continue;
    }
    stack.push({ tag: tagName, children: [] });
    match = tagRe.exec(source);
  }

  if (cursor < source.length) {
    pushCapsuleText(stack[stack.length - 1].children, source.slice(cursor));
  }
  while (stack.length > 1) {
    const frame = stack.pop();
    if (!frame || frame.tag === "root") break;
    stack[stack.length - 1].children.push({
      type: "element",
      tag: frame.tag,
      children: frame.children,
    });
  }
  return stack[0].children;
}

export function flattenCapsuleRichText(nodes: CapsuleRichNode[]): string {
  let out = "";
  for (const node of nodes) {
    if (node.type === "text") {
      out += node.value;
      continue;
    }
    if (node.type === "br") {
      out += "\n";
      continue;
    }
    const inner = flattenCapsuleRichText(node.children);
    if (node.tag === "p") {
      const trimmed = inner.trim();
      if (!trimmed) continue;
      if (out && !out.endsWith("\n")) out += "\n\n";
      else if (out.endsWith("\n") && !out.endsWith("\n\n")) out += "\n";
      out += `${trimmed}\n\n`;
      continue;
    }
    out += inner;
  }
  return out.replace(/\n{3,}/g, "\n\n");
}

export function normalizeCapsuleRichText(raw: string): string {
  return flattenCapsuleRichText(parseCapsuleRichText(raw)).trim();
}
