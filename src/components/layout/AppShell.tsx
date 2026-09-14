"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
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
  const [splashOn, setSplashOn] = useState(true);
  const onSplashActiveChange = useCallback((active: boolean) => {
    setSplashOn(active);
  }, []);

  return (
    <div
      id="app-shell"
      className={cn(
        "relative isolate mx-auto flex h-full min-h-full w-full max-w-md flex-col bg-white",
        "min-h-0 overflow-hidden",
        "[transform:translateZ(0)] [--trip-nav-height:calc(56px+env(safe-area-inset-bottom,0px))]",
        "md:border-x md:border-border",
        className,
      )}
    >
      <AppShellElementContext.Provider value={splashOn ? null : modalEl}>
        <div
          className={cn(
            "relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-x-clip overflow-y-hidden",
            splashOn && "invisible",
          )}
          aria-hidden={splashOn || undefined}
        >
          {children}
        </div>
        <Splash onActiveChange={onSplashActiveChange} />
        <div
          id="app-shell-modals"
          ref={setModalEl}
          className={cn(
            "pointer-events-none absolute inset-0 z-50 overflow-visible",
            splashOn && "invisible",
          )}
        />
      </AppShellElementContext.Provider>
    </div>
  );
}
