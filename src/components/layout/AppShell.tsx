import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Splash } from "@/components/splash";

/**
 * 모바일은 전체 폭, 태블릿/데스크톱은 최대 1152px로 넓히고 가운데 둔다.
 * 예전 max-w-md(448px) 잠금은 데스크톱에서 웹처럼 쓰기 어려워서 풀었다.
 */
export function AppShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col bg-background",
        "md:min-h-dvh md:border-x md:border-border",
        className,
      )}
    >
      {children}
      <Splash />
    </div>
  );
}
