"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Splash } from "@/components/splash";

const AppShellElementContext = createContext<HTMLElement | null>(null);

export function useAppShellElement() {
  return useContext(AppShellElementContext);
}

/**
 * V1은 모바일 퍼스트. 데스크톱에서도 max-w-md(448px) 프레임으로 둔다.
 */
export function AppShell({ children, className }: { children: ReactNode; className?: string }) {
  const [modalEl, setModalEl] = useState<HTMLElement | null>(null);

  return (
    <div
      id="app-shell"
      className={cn(
        "relative isolate mx-auto flex w-full max-w-md flex-col bg-white",
        "h-[var(--vv-height,100dvh)] min-h-0 overflow-visible",
        "[transform:translateZ(0)] [--trip-nav-height:56px]",
        "md:border-x md:border-border",
        className,
      )}
    >
      <AppShellElementContext.Provider value={modalEl}>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-clip overflow-y-hidden">
          {children}
          <Splash />
        </div>
        <div
          id="app-shell-modals"
          ref={setModalEl}
          className="pointer-events-none absolute inset-0 z-50 overflow-visible"
        />
      </AppShellElementContext.Provider>
    </div>
  );
}
