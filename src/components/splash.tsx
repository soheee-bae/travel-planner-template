"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMotionSafeDuration } from "@/hooks/use-motion-safe";

const MIN_VISIBLE_MS = 900;

export function Splash() {
  const [visible, setVisible] = useState(true);
  const exitDuration = useMotionSafeDuration("exit");

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="탭해서 건너뛰기"
          onClick={() => setVisible(false)}
          exit={{ opacity: 0 }}
          transition={{ duration: exitDuration }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[linear-gradient(180deg,#B8E3F5_0%,#FFF8EE_72%)]"
        >
          <div className="flex flex-col items-center gap-1 text-4xl" aria-hidden>
            <span>☁️ ☁️ ☁️</span>
            <span className="text-6xl">🏝️</span>
          </div>
          <p className="font-heading text-lg font-bold text-foreground">설레는 제주로 떠나는 중...</p>
          <p className="text-xs text-muted-foreground">탭해서 건너뛰기</p>
          <span className="mt-6 size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
