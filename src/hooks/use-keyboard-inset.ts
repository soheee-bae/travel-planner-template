"use client";

import { useLayoutEffect, useRef } from "react";

function isEditable(target: EventTarget | null): target is HTMLElement {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

/**
 * 카카오 인앱은 visualViewport가 툴바만큼 항상 작다.
 * inset만으로 키보드로 보면 셸 높이가 줄어 하단에 흰 공백이 생긴다.
 * 입력 포커스가 있을 때만 visualViewport 높이를 쓴다.
 */
export function useKeyboardInset() {
  const focusedRef = useRef(false);

  useLayoutEffect(() => {
    const root = document.documentElement;

    function apply() {
      const vv = window.visualViewport;
      const layoutHeight = window.innerHeight;
      const height = vv?.height ?? layoutHeight;
      const offsetTop = vv?.offsetTop ?? 0;
      const inset = Math.max(0, layoutHeight - height - offsetTop);
      const keyboardOpen = focusedRef.current && inset > 80;
      if (keyboardOpen) {
        root.dataset.keyboard = "open";
        root.style.setProperty("--vv-height", `${height}px`);
        root.style.setProperty("--keyboard-inset", `${inset}px`);
      } else {
        delete root.dataset.keyboard;
        root.style.removeProperty("--vv-height");
        root.style.setProperty("--keyboard-inset", "0px");
      }
    }

    apply();

    const vv = window.visualViewport;
    const onViewport = () => apply();
    const onFocusIn = (event: FocusEvent) => {
      if (!isEditable(event.target)) return;
      focusedRef.current = true;
      const el = event.target;
      window.setTimeout(() => {
        apply();
        el.scrollIntoView({ block: "center", inline: "nearest" });
      }, 80);
    };
    const onFocusOut = () => {
      focusedRef.current = false;
      window.setTimeout(apply, 80);
    };

    vv?.addEventListener("resize", onViewport);
    window.addEventListener("resize", onViewport);
    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);
    return () => {
      vv?.removeEventListener("resize", onViewport);
      window.removeEventListener("resize", onViewport);
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
    };
  }, []);
}
