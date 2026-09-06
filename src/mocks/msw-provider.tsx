"use client";

import { useEffect, type ReactNode } from "react";

declare global {
  interface Window {
    __mswWorkerStarted?: boolean;
  }
}

/**
 * 개발 환경에서는 기본으로 MSW를 켠다 (실 백엔드가 아직 없음, Phase 10 전까지).
 * `.env.local`에 NEXT_PUBLIC_ENABLE_MSW=false 를 명시하면 끌 수 있고,
 * 프로덕션 빌드에서는 기본으로 꺼진다 — 단, e2e 테스트처럼 프로덕션 빌드로
 * mock을 켜야 할 때는 빌드 시점에 NEXT_PUBLIC_ENABLE_MSW=true 로 명시하면
 * 켜진다(playwright.config.ts webServer 참고). NEXT_PUBLIC_* 는 빌드 시점에
 * 인라인되므로 런타임에 바꿀 수 없다.
 *
 * 워커 등록을 기다리지 않는다. Fast Refresh로 이미 enable된 네트워크에
 * start()를 다시 치면 configure() invariant가 난다. 그 경우 Next
 * `/api/trips/*` mock 라우트가 같은 시드를 내려준다.
 */
const shouldEnableMSW =
  process.env.NEXT_PUBLIC_ENABLE_MSW === "true" ||
  (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_MSW !== "false");

export function MSWProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!shouldEnableMSW || window.__mswWorkerStarted) return;
    window.__mswWorkerStarted = true;

    void import("@/mocks/browser")
      .then(({ worker }) => worker.start({ onUnhandledRequest: "bypass", quiet: true }))
      .catch(() => {
        // 이미 활성인 워커. 화면은 Next mock API로 동작한다.
      });
  }, []);

  return <>{children}</>;
}
