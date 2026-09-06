import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Splash } from "@/components/splash";

/**
 * V1은 모바일 퍼스트. 데스크톱에서도 max-w-md(448px) 프레임으로 둔다.
 */
export function AppShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background",
        "md:border-x md:border-border",
        className,
      )}
    >
      {children}
      <Splash />
    </div>
  );
}
