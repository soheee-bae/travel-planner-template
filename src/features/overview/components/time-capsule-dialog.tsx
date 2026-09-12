"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const CAPSULES = [
  {
    emoji: "🍊",
    when: "출발 당일 09:15",
    title: "설레는 아침!",
    body: "제주행 탑승구 앞에서 이 봉투를 열어봐 🍊",
    locked: false,
  },
  {
    emoji: "🐷",
    when: "Day 1 저녁 20:00",
    title: "흑돼지 먹으면서 열어 봐",
    body: "오늘 하루도 수고했어 🐷",
    locked: false,
  },
  {
    emoji: "🎂",
    when: "10월 15일 생일 당일!",
    title: "생일 축하해 준형아 🎂",
    body: "네가 있어서 이 여행이 더 빛나 💕",
    locked: false,
    highlight: true,
  },
  {
    emoji: "🔒",
    when: "귀국 후 10.19 자정",
    title: "???",
    body: "🔒 잠김",
    locked: true,
  },
] as const;

export function TimeCapsuleDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-[rgba(0,0,0,0.45)] supports-backdrop-filter:backdrop-blur-none"
        className="max-h-[min(90%,var(--vv-height,85dvh))] gap-0 rounded-t-[28px] bg-white p-5 pt-6 shadow-[0px_2px_12px_rgba(0,0,0,0.06)] ring-0"
      >
        <DialogHeader className="items-center gap-1.5 text-center">
          <DialogTitle className="flex h-[30px] items-center justify-center text-center text-[20px] leading-[30px] font-extrabold text-[#4A4543]">
            타임캡슐 여정
          </DialogTitle>
          <p className="flex h-[18px] items-center text-[12px] leading-[18px] font-normal text-[#B0AAA6]">
            여행 중 열어볼 특별한 메시지들
          </p>
        </DialogHeader>
        <ol className="relative mx-auto mt-4 flex w-full max-w-[320px] flex-col gap-4">
          {CAPSULES.map((item) => (
            <li key={item.title} className="relative flex min-h-[110px] items-start">
              <span className="mt-1.5 mr-3 flex size-12 shrink-0 items-center justify-center text-[28px]">
                {item.emoji}
              </span>
              <div
                className={cn(
                  "flex w-[134.4px] flex-col items-start gap-0.5 rounded-[14px] px-3 py-2.5 shadow-[0px_2px_12px_rgba(0,0,0,0.06)]",
                  "highlight" in item && item.highlight
                    ? "h-[129px] border border-[#F09040] bg-[#FDECD8] px-[12.5px] py-[10.5px]"
                    : "h-[110px] border border-[#EAE4D8] bg-[#FDF9F1]",
                  item.locked && "blur-[1.5px]",
                )}
              >
                <p className="flex h-[15px] w-full items-center font-nunito text-[10px] leading-[15px] font-bold text-[#F09040]">
                  {item.when}
                </p>
                <p className="flex h-[18px] w-full items-center text-[12px] leading-[18px] font-bold text-[#4A4543]">
                  {item.title}
                </p>
                <p className="mt-px w-full text-[11px] leading-4 font-normal text-[#8C8885]">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="mt-5 flex h-[49px] w-full items-center justify-center rounded-[14px] bg-[#F09040] py-[13px] text-[15px] leading-[22px] font-bold text-white shadow-[0px_2px_12px_rgba(0,0,0,0.06)]"
        >
          닫기
        </button>
      </DialogContent>
    </Dialog>
  );
}
