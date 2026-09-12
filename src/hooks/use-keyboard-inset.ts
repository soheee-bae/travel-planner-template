"use client";

import { useLayoutEffect } from "react";

function isEditable(target: EventTarget | null): target is HTMLElement {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

function applyVisualViewportVars() {
  const root = document.documentElement;
  const vv = window.visualViewport;
  const height = vv?.height ?? window.innerHeight;
  const offsetTop = vv?.offsetTop ?? 0;
  const inset = Math.max(0, window.innerHeight - height - offsetTop);
  root.style.setProperty("--vv-height", `${height}px`);
  root.style.setProperty("--keyboard-inset", `${inset}px`);
}

/**
 * iOS는 `interactive-widget=resizes-content`여도 키보드가 레이아웃을
 * 안 줄이는 경우가 많다. visualViewport 높이로 셸을 맞추고, 포커스된
 * 필드는 보이는 영역 안으로 스크롤한다.
 */
export function useKeyboardInset() {
  useLayoutEffect(() => {
    applyVisualViewportVars();

    const vv = window.visualViewport;
    const onViewport = () => applyVisualViewportVars();
    const onFocusIn = (event: FocusEvent) => {
      if (!isEditable(event.target)) return;
      const el = event.target;
      window.setTimeout(() => {
        applyVisualViewportVars();
        el.scrollIntoView({ block: "center", inline: "nearest" });
      }, 50);
    };

    vv?.addEventListener("resize", onViewport);
    vv?.addEventListener("scroll", onViewport);
    window.addEventListener("resize", onViewport);
    window.addEventListener("focusin", onFocusIn);
    return () => {
      vv?.removeEventListener("resize", onViewport);
      vv?.removeEventListener("scroll", onViewport);
      window.removeEventListener("resize", onViewport);
      window.removeEventListener("focusin", onFocusIn);
    };
  }, []);
}
