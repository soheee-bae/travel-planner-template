"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useMotionSafeDuration, useReducedMotion } from "@/hooks/use-motion-safe";
import { easing, offset } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function SegmentedSwap({
  activeKey,
  direction,
  children,
  className,
}: {
  activeKey: string;
  direction: number;
  children: ReactNode;
  className?: string;
}) {
  const slide = useMotionSafeDuration("slide");
  const reduce = useReducedMotion();
  const shift = reduce ? 0 : offset.segment;

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div
          key={activeKey}
          custom={direction}
          variants={{
            enter: (dir: number) => ({ x: dir * shift, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (dir: number) => ({ x: dir * -shift, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: slide, ease: easing.standard }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
