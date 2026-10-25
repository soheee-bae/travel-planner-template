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
      "여행이 시작됐어.<br><br>출발 전에 같이 사진 한 장 남기고 가보자.",
    imgSrc: "/illustrations/firststep.png",
    playsConfetti: false,
  },
  {
    sortOrder: 2,
    title: "둘째 날 점심 🍽️",
    summary: "맛있는 점심 먹으면서 열어봐!",
    popupTitle: "든든하게 먹고 놀자",
    popupText:
      "어제 일정 소화하느라 고생했어!<br><br>오늘 밥도 꿀맛이지? 🐷<br><br>다 먹고 오후 일정도<br>신나게 달려보자구!",
    imgSrc: "/illustrations/secondstep.png",
    playsConfetti: false,
  },
  {
    sortOrder: 3,
    title: "특별한 저녁",
    summary: "하루가 저물면 열어봐",
    popupTitle: "오늘의 쪽지",
    popupText: "오늘 일정이 끝나면<br>서로에게 짧은 쪽지를 남겨 봐.",
    imgSrc: "/illustrations/thridstep.png",
    playsConfetti: true,
  },
  {
    sortOrder: 4,
    title: "여행의 하이라이트",
    summary: "오늘을 기록해 둬",
    popupTitle: "오늘을 남겨 둬",
    popupText: "오늘 하루를 짧게 남겨 두면<br>나중에 다시 꺼내 볼 수 있어.",
    imgSrc: "/illustrations/fourthstep.png",
    playsConfetti: false,
  },
  {
    sortOrder: 5,
    title: "아쉬운 귀국길 🌙",
    summary: "비행기 타기 전 마지막 편지",
    popupTitle: "우리의 다음 여행은?",
    popupText:
      "시간 진짜 빠르다.<br><br>다음에 가고 싶은 곳을<br>하나만 정해 보자.",
    imgSrc: "/illustrations/fifthstep.png",
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
