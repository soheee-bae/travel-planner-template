"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CAPSULES = [
  { emoji: "🍊", when: "Day 1 저녁 20:00", title: "설레는 아침!", body: "도착하면 귤 아이스크림부터!", locked: false },
  { emoji: "🐷", when: "Day 1 밤", title: "흑돼지 타임", body: "고기 굽는 동안 사진 많이 찍기", locked: false },
  { emoji: "🎂", when: "10월 15일 생일 당일!", title: "생일 서프라이즈", body: "케이크는 미리 픽업해 두기", locked: false, highlight: true },
  { emoji: "🔒", when: "Day 3", title: "아직 비밀", body: "여행 중에 열려요", locked: true },
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
          <DialogTitle className="font-heading text-xl">타임캡슐 여정</DialogTitle>
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
