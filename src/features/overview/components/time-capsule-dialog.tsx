"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
];

export function TimeCapsuleDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-t-[2rem]" showCloseButton={false}>
        <DialogHeader className="items-center text-center">
          <p className="text-3xl" aria-hidden>
            🗺️
          </p>
          <DialogTitle className="font-heading text-xl">🗺 타임캡슐 여정</DialogTitle>
          <p className="text-sm text-muted-foreground">여행 중 열어볼 특별한 메시지들</p>
        </DialogHeader>
        <ol className="relative mx-auto max-w-sm space-y-4 border-l border-dashed border-primary/40 pl-6">
          {CAPSULES.map((item) => (
            <li key={item.title} className="relative">
              <span className="absolute top-2 -left-[34px] flex size-8 items-center justify-center rounded-full border border-primary bg-card text-sm">
                {item.emoji}
              </span>
              <div
                className={`rounded-2xl bg-card p-3 ring-1 ${
                  item.highlight ? "ring-primary" : "ring-border"
                } ${item.locked ? "opacity-50 blur-[0.4px]" : ""}`}
              >
                <p className="text-xs font-bold text-primary">{item.when}</p>
                <p className="text-sm font-bold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <Button className="h-12 w-full rounded-full text-base" onClick={() => onOpenChange(false)}>
          닫기
        </Button>
      </DialogContent>
    </Dialog>
  );
}
