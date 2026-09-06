"use client";

import { AccountBar } from "@/features/auth/account-bar";
import { AppBottomNav } from "@/features/trips/components/app-bottom-nav";
import { isMockData } from "@/lib/data-source";

export default function MePage() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 overflow-y-auto p-6 pb-24">
        <h1 className="font-serif text-2xl font-semibold text-foreground">마이페이지</h1>
        {isMockData() ? (
          <p className="text-sm text-muted-foreground">
            mock 모드에서는 로그인 정보가 없어. 실 DB로 켜면 이메일과 로그아웃이 보여.
          </p>
        ) : (
          <AccountBar />
        )}
      </main>
      <AppBottomNav />
    </>
  );
}
