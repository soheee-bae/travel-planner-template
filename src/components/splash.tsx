"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTripPeople } from "@/features/trips/people-hooks";
import { useTrips } from "@/features/trips/hooks";
import { useReducedMotion } from "@/hooks/use-motion-safe";
import { ILLUSTRATION } from "@/lib/illustrations";
import { easing } from "@/lib/motion";

const SPLASH_MS = 2500;
const EXIT_S = 0.5;

export function Splash({ onActiveChange }: { onActiveChange?: (active: boolean) => void }) {
  const [visible, setVisible] = useState(true);
  const reduce = useReducedMotion();
  const { data: trips } = useTrips();
  const trip = trips?.[0];
  const { data: people } = useTripPeople(trip?.id ?? "");
  const names = (people ?? []).map((person) => person.displayName).filter(Boolean);
  const label = names.length > 0 ? names.join(" & ") : "함께";
  const suffix = trip?.destinationCity ? `in ${trip.destinationCity}...` : "planner...";

  useEffect(() => {
    onActiveChange?.(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      onActiveChange?.(false);
    }, SPLASH_MS);
    return () => window.clearTimeout(timer);
  }, [onActiveChange]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="status"
          aria-live="polite"
          aria-label={`${label} ${suffix}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : EXIT_S, ease: easing.standard }}
          className="absolute inset-0 z-[80] flex flex-col items-center justify-center bg-white pb-[12vh] shadow-[0px_0px_80px_rgba(0,0,0,0.12)]"
        >
          <motion.img
            src={ILLUSTRATION.splash}
            alt=""
            width={212}
            height={124}
            animate={reduce ? undefined : { y: [0, -8, 0] }}
            transition={
              reduce ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
            }
            className="h-[124px] w-[212px] object-contain"
          />
          <p className="mt-[15px] w-full px-6 text-center font-nunito text-[14px] leading-[33px] font-extrabold text-[#4A4A4A]">
            <span>{label}&nbsp;</span>
            <Typewriter suffix={suffix} reduce={!!reduce} />
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Typewriter({ suffix, reduce }: { suffix: string; reduce: boolean }) {
  const [count, setCount] = useState(reduce ? suffix.length : 0);
  const [cursorOn, setCursorOn] = useState(true);

  useEffect(() => {
    if (reduce) return;
    const type = window.setInterval(() => {
      setCount((current) => (current >= suffix.length + 5 ? 0 : current + 1));
    }, 180);
    const blink = window.setInterval(() => {
      setCursorOn((on) => !on);
    }, 400);
    return () => {
      window.clearInterval(type);
      window.clearInterval(blink);
    };
  }, [reduce, suffix]);

  return (
    <span className="inline" aria-hidden>
      {suffix.slice(0, Math.min(count, suffix.length))}
      <span className={cursorOn && !reduce ? "opacity-100" : "opacity-0"}>|</span>
    </span>
  );
}
