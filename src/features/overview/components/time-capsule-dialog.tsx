"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FigmaCtaButton } from "@/components/ui/figma";
import { CapsuleSkeleton } from "@/components/ui/page-skeleton";
import { useTimeCapsules } from "@/features/overview/hooks";
import { useMotionSafeDuration, useReducedMotion } from "@/hooks/use-motion-safe";
import { formatSeoulDateTime } from "@/lib/date";
import { easing } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { IllustrationIcon } from "@/components/ui/illustration-icon";
import { CAPSULE_UNLOCK_ICON, ILLUSTRATION } from "@/lib/illustrations";
import { capsulePopupView, isCapsuleUnlocked, normalizeCapsuleRichText, type TimeCapsule } from "@/mocks/fixtures/time-capsules";

const NODE_SIZE = 48;
/** 원과 말풍선 사이 간격. 5단계 모두 동일. */
const BUBBLE_GAP = 20;
const CARD_OFFSET_Y = -11;
/** 구간마다 베지에 중점을 살짝 다르게 잡아 점선이 기계적으로 안 보이게. */
const CURVE_T = [0.4, 0.58, 0.46, 0.63] as const;

/**
 * 1→2는 말풍선이 안 겹칠 만큼만 벌리고, 아래로 갈수록 S 진폭이 커진다.
 */
const TRACK_HEIGHT = 680;
const LAYOUT = [
  { nodeLeft: 84, nodeTop: 8, side: "right" },
  { nodeLeft: 208, nodeTop: 148, side: "left" },
  { nodeLeft: 44, nodeTop: 298, side: "right" },
  { nodeLeft: 246, nodeTop: 452, side: "left" },
  { nodeLeft: 22, nodeTop: 598, side: "right" },
] as const;

function cardTopFor(nodeTop: number): number {
  return Math.max(0, nodeTop + CARD_OFFSET_Y);
}

function dottedPath(): string {
  const points = LAYOUT.map((layout) => ({
    x: layout.nodeLeft + NODE_SIZE / 2,
    y: layout.nodeTop + NODE_SIZE / 2,
  }));
  let d = `M${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const cur = points[i];
    const t = CURVE_T[i - 1] ?? 0.5;
    const midY = prev.y + (cur.y - prev.y) * t;
    d += ` C${prev.x} ${midY} ${cur.x} ${midY} ${cur.x} ${cur.y}`;
  }
  return d;
}

function fireBirthdayConfetti() {
  void confetti({
    particleCount: 140,
    spread: 78,
    startVelocity: 38,
    origin: { y: 0.55 },
    colors: ["#F09040", "#FFB4C8", "#FFE0BC", "#A8D8EA", "#FFF8EE"],
  });
}

export function TimeCapsuleDialog({
  tripId,
  open,
  onOpenChange,
}: {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: capsules = [], isLoading, isError } = useTimeCapsules(tripId, open);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const enter = useMotionSafeDuration("enter");
  const exit = useMotionSafeDuration("exit");
  const selected = capsules.find((item) => item.id === selectedId) ?? null;
  const selectedUnlocked = selected ? isCapsuleUnlocked(selected.unlockAt, nowMs) : false;
  const popup = selected ? capsulePopupView(selected) : null;

  useEffect(() => {
    if (!open) return;
    setNowMs(Date.now());
    const timer = window.setInterval(() => setNowMs(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      setToast(null);
      setShakeId(null);
    }
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!selectedId || reduce) return;
    const item = capsules.find((capsule) => capsule.id === selectedId);
    if (!item?.playsConfetti || !isCapsuleUnlocked(item.unlockAt)) return;
    fireBirthdayConfetti();
  }, [selectedId, reduce, capsules]);

  function handleNodeClick(item: TimeCapsule) {
    const unlocked = isCapsuleUnlocked(item.unlockAt, Date.now());
    if (unlocked) {
      setSelectedId(item.id);
      return;
    }
    setShakeId(item.id);
    setToast(item.lockedToast);
    window.setTimeout(() => setShakeId((current) => (current === item.id ? null : current)), 500);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        variant="center"
        overlayClassName="bg-[rgba(0,0,0,0.35)]"
        className="relative left-1/2 right-auto flex h-[min(755px,calc(100%-24px))] max-h-[1056px] w-[min(360px,calc(100%-20px))] max-w-[380px] -translate-x-1/2 flex-col items-center overflow-hidden rounded-[28px] bg-white px-5 pt-6 pb-7 shadow-[0px_8px_32px_rgba(74,69,67,0.13)]"
      >
        <DialogHeader scrollShadow={false} className="mb-4 w-full shrink-0 items-center gap-1.5 pb-0 text-center">
          <DialogTitle className="flex h-[30px] items-center justify-center text-center text-[20px] leading-[30px] font-extrabold text-[#4A4543]">
            소희 가이드 시크릿 노트
          </DialogTitle>
          <p className="text-center text-[12px] leading-[18px] font-normal text-[#B0AAA6]">
            가이드가 여행 중간중간 숨겨둔 특별한 메세지들!
          </p>
        </DialogHeader>

        <div
          className={cn(
            "min-h-0 w-full flex-1",
            selectedId ? "overflow-hidden" : "overflow-y-auto overscroll-contain",
          )}
        >
        {isLoading ? (
          <CapsuleSkeleton />
        ) : isError ? (
          <p className="py-10 text-center text-[12px] leading-[18px] font-semibold text-[#E85D4C]">
            타임캡슐을 다시 불러와 줘.
          </p>
        ) : (
          <ol className="relative w-full shrink-0" style={{ height: TRACK_HEIGHT }}>
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox={`0 0 320 ${TRACK_HEIGHT}`}
              fill="none"
              aria-hidden
            >
              <path
                d={dottedPath()}
                stroke="#EAE4D8"
                strokeWidth="3"
                strokeDasharray="8 8"
                strokeLinecap="round"
              />
            </svg>
            {capsules.map((item, index) => {
              const unlocked = isCapsuleUnlocked(item.unlockAt, nowMs);
              const unlockIcon = CAPSULE_UNLOCK_ICON[item.sortOrder];
              const layout = LAYOUT[index] ?? LAYOUT[0];
              const cardTop = cardTopFor(layout.nodeTop);
              const tailOnLeft = layout.side === "right";
              const tailTop = layout.nodeTop + NODE_SIZE / 2 - cardTop;
              const bubbleOffset = NODE_SIZE + BUBBLE_GAP;
              return (
                <li key={item.id}>
                  <motion.button
                    type="button"
                    aria-label={unlocked ? `${item.title} 열기` : `${item.title}, 아직 잠김`}
                    aria-haspopup={unlocked ? "dialog" : undefined}
                    onClick={() => handleNodeClick(item)}
                    animate={
                      reduce || shakeId !== item.id
                        ? { x: 0 }
                        : { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                    }
                    transition={{ duration: 0.45, ease: easing.standard }}
                    className="absolute z-10 overflow-visible"
                    style={{ left: layout.nodeLeft, top: layout.nodeTop }}
                  >
                    <span
                      className="relative z-20 flex size-12 items-center justify-center overflow-hidden rounded-full border-[3px] border-[#FF9F43] bg-white"
                      aria-hidden
                    >
                      <IllustrationIcon
                        src={unlocked && unlockIcon ? unlockIcon : ILLUSTRATION.lock}
                        className="size-8"
                      />
                    </span>
                    <span
                      className="absolute z-10 box-border flex w-max max-w-[168px] flex-col items-start gap-0.5 overflow-visible rounded-[14px] border border-[#EAE4D8] bg-white px-3 py-2.5 text-left shadow-[0px_2px_12px_rgba(0,0,0,0.06)]"
                      style={{
                        top: cardTop - layout.nodeTop,
                        ...(layout.side === "right"
                          ? { left: bubbleOffset }
                          : { right: bubbleOffset }),
                      }}
                    >
                      <span
                        className={cn(
                          "absolute size-3 rotate-45 border-[#EAE4D8] bg-white",
                          tailOnLeft ? "-left-[6px] border-b border-l" : "-right-[6px] border-t border-r",
                        )}
                        style={{ top: tailTop - 6 }}
                        aria-hidden
                      />
                      <span className="font-nunito relative text-[10px] leading-[15px] font-bold text-[#FF9F43]">
                        {formatSeoulDateTime(item.unlockAt)}
                      </span>
                      <span className="relative text-[12px] leading-[18px] font-bold text-[#4A4543]">
                        {item.title}
                      </span>
                      <span className="relative pt-px text-[11px] leading-4 font-normal text-[#8C8885]">
                        {item.summary}
                      </span>
                    </span>
                  </motion.button>
                </li>
              );
            })}
          </ol>
        )}
        </div>

        <FigmaCtaButton className="mt-4 shrink-0" onClick={() => onOpenChange(false)}>
          닫기
        </FigmaCtaButton>

        <AnimatePresence>
          {toast ? (
            <motion.p
              role="status"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: enter, ease: easing.standard }}
              className="pointer-events-none absolute bottom-24 left-1/2 z-[70] w-[min(86%,320px)] -translate-x-1/2 rounded-[14px] bg-[#4A4543] px-4 py-2.5 text-center text-[13px] leading-5 font-medium text-white shadow-[0px_8px_24px_rgba(74,69,67,0.25)]"
            >
              {toast}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {selected && selectedUnlocked && popup ? (
            <motion.div
              className="absolute inset-0 z-[80] flex items-center justify-center rounded-[28px] bg-black/45 px-5 pb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: exit, ease: easing.standard }}
              onClick={() => setSelectedId(null)}
              onWheel={(event) => {
                if (event.target === event.currentTarget) event.stopPropagation();
              }}
              onTouchMove={(event) => {
                if (event.target === event.currentTarget) event.stopPropagation();
              }}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="capsule-popup-title"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.86 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                transition={{ duration: enter, ease: easing.standard }}
                className="flex h-[min(560px,calc(100%-8rem))] max-h-[1056px] w-[min(360px,calc(100%-8px))] max-w-[380px] shrink-0 flex-col items-start gap-0 overflow-hidden rounded-[28px] bg-white p-5 shadow-[0px_8px_32px_rgba(74,69,67,0.13)]"
                onClick={(event) => event.stopPropagation()}
              >
                <DialogHeader className="w-full shrink-0 gap-0 bg-white p-0 pb-5">
                  <h3
                    id="capsule-popup-title"
                    className="flex min-h-[24px] w-full items-center justify-center text-center text-[16px] leading-[24px] font-extrabold text-[#4A4543]"
                  >
                    {popup.title}
                  </h3>
                </DialogHeader>
                <div className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain">
                  <div className="h-[231px] w-full overflow-hidden bg-white">
                    <img
                      src={selected.imgSrc}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="pt-2.5 text-[12px] leading-[22px] font-normal whitespace-pre-wrap break-words text-black">
                    {normalizeCapsuleRichText(popup.text)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="mt-2.5 flex h-[49px] w-full shrink-0 items-center justify-center rounded-[14px] bg-[#FF9F43] py-[13px] text-[15px] leading-[22px] font-bold text-white shadow-[0px_6px_20px_rgba(255,159,67,0.3)]"
                >
                  {popup.cta}
                </button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
