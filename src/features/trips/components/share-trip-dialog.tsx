"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { inviteTripMember } from "@/features/trips/members-api";
import { isMockData } from "@/lib/data-source";

export function ShareTripDialog({
  tripId,
  open,
  onOpenChange,
}: {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("working");
    setMessage(null);
    try {
      if (isMockData()) {
        setStatus("done");
        setMessage("mock 모드에서는 공유가 저장되지 않아. 실 DB에서 초대해.");
        return;
      }
      await inviteTripMember(tripId, email.trim());
      setStatus("done");
      setMessage(`${email}을 편집 멤버로 추가했어. 상대가 먼저 가입·로그인해야 보여.`);
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "초대에 실패했어.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>여행 공유</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          이미 이 앱에 가입한 이메일만 추가할 수 있어. 추가되면 같은 여행을 함께 수정할 수
          있어.
        </p>
        <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="share-email">상대 이메일</Label>
            <Input
              id="share-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@email.com"
            />
          </div>
          <Button type="submit" className="h-10" disabled={status === "working"}>
            멤버로 추가
          </Button>
          {message && (
            <p
              role="status"
              className={status === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
            >
              {message}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
