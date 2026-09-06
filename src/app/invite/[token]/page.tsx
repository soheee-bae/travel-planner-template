"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { acceptTripInvite } from "@/features/trips/members-api";
import { isMockData } from "@/lib/data-source";

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [message, setMessage] = useState("초대를 확인하는 중…");

  useEffect(() => {
    if (isMockData()) {
      setMessage("mock 모드에서는 초대 링크가 동작하지 않아.");
      return;
    }
    void acceptTripInvite(token)
      .then((tripId) => {
        setMessage("여행에 합류했어.");
        router.replace(`/trips/${tripId}`);
      })
      .catch((err: unknown) => {
        setMessage(err instanceof Error ? err.message : "초대를 수락하지 못했어.");
      });
  }, [token, router]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button type="button" variant="outline" onClick={() => router.push("/trips")}>
        여행 목록
      </Button>
    </main>
  );
}
