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
  const layoutHeight = window.innerHeight;
  const height = vv?.height ?? layoutHeight;
  const offsetTop = vv?.offsetTop ?? 0;
  const inset = Math.max(0, layoutHeight - height - offsetTop);
  const keyboardOpen = inset > 80;
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

/**
 * 키보드는 열렸을 때만 셸 높이를 visualViewport에 맞춘다.
 * 카카오 인앱에서 평소 `--vv-height`를 계속 넣으면 하단에 흰 공백이 생긴다.
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
      }, 80);
    };
    const onFocusOut = () => {
      window.setTimeout(applyVisualViewportVars, 80);
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
