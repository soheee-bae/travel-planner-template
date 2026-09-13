"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  createTripInviteLink,
  inviteTripMember,
  listTripMembers,
  removeTripMember,
  type TripMember,
} from "@/features/trips/members-api";
import { isMockData } from "@/lib/data-source";

export function ShareTripDialog({
  tripId,
  isOwner,
  open,
  onOpenChange,
}: {
  tripId: string;
  isOwner: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [members, setMembers] = useState<TripMember[]>([]);

  useEffect(() => {
    if (!open) return;
    void listTripMembers(tripId)
      .then(setMembers)
      .catch(() => setMembers([]));
  }, [open, tripId]);

  async function copyInviteLink() {
    setStatus("working");
    setMessage(null);
    try {
      if (isMockData()) {
        const mock = `${window.location.origin}/invite/mock-${tripId}`;
        await navigator.clipboard.writeText(mock);
        setLink(mock);
        setStatus("done");
        setMessage("초대 링크를 복사했어. mock에서는 실제 합류가 안 돼.");
        return;
      }
      const url = await createTripInviteLink(tripId);
      await navigator.clipboard.writeText(url);
      setLink(url);
      setStatus("done");
      setMessage("초대 링크를 복사했어. 로그인하면 멤버로 들어와.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "링크를 만들지 못했어.");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("working");
    setMessage(null);
    try {
      if (isMockData()) {
        setStatus("done");
        setMessage("mock 모드에서는 이메일 초대가 저장되지 않아.");
        return;
      }
      await inviteTripMember(tripId, email.trim());
      setStatus("done");
      setMessage(`${email}을 멤버로 추가했어.`);
      setEmail("");
      setMembers(await listTripMembers(tripId));
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "초대에 실패했습니다. 다시 시도해 주세요.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>동행자 초대</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap gap-1">
          {members.map((member) => (
            <span
              key={member.userId}
              title={member.email}
              className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-medium"
            >
              {(member.email[0] ?? "?").toUpperCase()}
            </span>
          ))}
        </div>
        {isOwner && (
          <>
            <Button type="button" variant="outline" onClick={() => void copyInviteLink()}>
              초대 링크 복사
            </Button>
            {link && <p className="break-all text-xs text-muted-foreground">{link}</p>}
            <form onSubmit={onSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="share-email">가입된 이메일로 추가</Label>
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
            </form>
            <ul className="flex flex-col gap-2">
              {members
                .filter((m) => !m.isOwner)
                .map((member) => (
                  <li key={member.userId} className="flex items-center justify-between text-sm">
                    <span>{member.email}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        void removeTripMember(tripId, member.userId).then(() =>
                          listTripMembers(tripId).then(setMembers),
                        );
                      }}
                    >
                      강퇴
                    </Button>
                  </li>
                ))}
            </ul>
          </>
        )}
        {!isOwner && (
          <p className="text-sm text-muted-foreground">멤버는 초대·강퇴를 할 수 없어.</p>
        )}
        {message && (
          <p
            role="status"
            className={
              status === "error"
                ? "text-[12px] leading-[18px] font-semibold text-[#E85D4C]"
                : "text-sm text-muted-foreground"
            }
          >
            {message}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
