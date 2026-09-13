"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/hooks/use-motion-safe";
import { easing } from "@/lib/motion";

const SPLASH_MS = 2500;
const EXIT_S = 0.5;

export function Splash() {
  const [visible, setVisible] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), SPLASH_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="status"
          aria-live="polite"
          aria-label="소희 & 준형 in JEJU"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : EXIT_S, ease: easing.standard }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-[30px] bg-[#F5F4F2] shadow-[0px_0px_80px_rgba(0,0,0,0.12)]"
        >
          <motion.img
            src="/assets/duck-airport.svg"
            alt=""
            width={91}
            height={88}
            animate={reduce ? undefined : { y: [0, -10, 0] }}
            transition={
              reduce ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
            }
            className="h-[88px] w-[91px] object-contain"
          />
          <p className="flex h-[33px] items-center text-center font-nunito text-[16px] leading-[33px] font-extrabold text-[#F09040]">
            <span>소희 & 준형&nbsp;</span>
            <JejuTypewriter reduce={!!reduce} />
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

const JEJU_SUFFIX = "in JEJU";

function JejuTypewriter({ reduce }: { reduce: boolean }) {
  const [count, setCount] = useState(reduce ? JEJU_SUFFIX.length : 0);
  const [cursorOn, setCursorOn] = useState(true);

  useEffect(() => {
    if (reduce) return;
    const type = window.setInterval(() => {
      setCount((current) => (current >= JEJU_SUFFIX.length + 5 ? 0 : current + 1));
    }, 180);
    const blink = window.setInterval(() => {
      setCursorOn((on) => !on);
    }, 400);
    return () => {
      window.clearInterval(type);
      window.clearInterval(blink);
    };
  }, [reduce]);

  return (
    <span className="inline-flex min-w-[4.6em] items-center text-left" aria-hidden>
      {JEJU_SUFFIX.slice(0, Math.min(count, JEJU_SUFFIX.length))}
      <span className={cursorOn && !reduce ? "opacity-100" : "opacity-0"}>|</span>
    </span>
  );
}
