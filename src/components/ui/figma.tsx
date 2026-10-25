"use client";

import { useRef, type ButtonHTMLAttributes, type PointerEvent, type ReactNode, type UIEvent } from "react";
import { DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const figmaShadowCard = "shadow-[0px_2px_12px_rgba(0,0,0,0.06)]";
export const figmaShadowLift = "shadow-[0px_4px_18px_rgba(74,69,67,0.1)]";
export const figmaShadowCta = "shadow-[0px_8px_24px_rgba(255,159,67,0.25)]";
export const figmaHeaderScrolledShadow = "shadow-[0_4px_10px_rgba(0,0,0,0.04)]";

const figmaPageHeaderChrome = cn(
  "relative z-10 bg-white transition-shadow duration-200",
  "data-[scrolled]:shadow-[0_4px_10px_rgba(0,0,0,0.04)]",
);

export function applyTitleScrollShadow(scrollEl: HTMLElement) {
  const header = scrollEl.previousElementSibling;
  if (!(header instanceof HTMLElement)) return;
  header.toggleAttribute("data-scrolled", scrollEl.scrollTop > 0);
}

function onTitleScroll(event: UIEvent<HTMLElement>) {
  applyTitleScrollShadow(event.currentTarget);
}

export const figmaInputClass = cn(
  "h-11 w-full rounded-[14px] border-0 bg-white px-4 py-[13.5px]",
  "text-[14px] leading-[17px] text-[#1A1A1A]",
  figmaShadowCard,
  "placeholder:text-[rgba(26,26,26,0.5)]",
  "focus-visible:ring-0 focus-visible:ring-offset-0",
);

export const figmaTextareaClass = cn(
  figmaInputClass,
  "h-[127px] min-h-[127px] resize-none py-[13.5px] leading-[21px]",
  "placeholder:text-[rgba(74,69,67,0.5)]",
);

export function FigmaPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col items-start gap-4 px-5 pt-0 pb-6", className)}>{children}</div>
  );
}

export function FigmaPageTitle({
  children,
  className,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <Tag
      className={cn(
        "flex h-[30px] w-full items-center font-nunito text-[20px] leading-[30px] font-bold text-[#1A1A1A]",
        className,
      )}
    >
      <span className="min-w-0 truncate">{children}</span>
    </Tag>
  );
}

export function FigmaPageHeader({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex w-full shrink-0 flex-col items-start px-[22px] pt-[calc(12px+env(safe-area-inset-top,0px))] pb-3",
        figmaPageHeaderChrome,
      )}
    >
      {children}
    </div>
  );
}

export function FigmaPageScroll({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", className)}
      onScroll={onTitleScroll}
    >
      {children}
    </div>
  );
}

export function FigmaCard({
  children,
  className,
  lift = false,
}: {
  children: ReactNode;
  className?: string;
  lift?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-start rounded-[20px] bg-white",
        lift ? figmaShadowLift : figmaShadowCard,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FigmaChip({
  active,
  tone = "orange",
  size = "md",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  tone?: "orange" | "dark";
  size?: "sm" | "md";
}) {
  const activeBg = tone === "dark" ? "bg-[#4A4543] text-white" : "bg-[#FF893B] text-white";
  return (
    <button
      type="button"
      aria-pressed={active}
      {...props}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[99px] font-semibold",
        figmaShadowCard,
        size === "md"
          ? "h-7 px-5 py-2 text-[13px] leading-5"
          : "h-7 px-4 py-[7px] text-xs leading-[18px]",
        active ? activeBg : "bg-white text-[#555555]",
        "disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** 칩 그림자가 overflow 스크롤에 잘리지 않게 여백을 둔다. */
export function FigmaChipRow({
  children,
  className,
  role,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  role?: string;
  "aria-label"?: string;
}) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={cn("-mx-3 -my-2 w-[calc(100%+24px)] overflow-x-auto px-3 py-3.5", className)}
    >
      <div className="flex w-max min-w-full flex-nowrap gap-2">{children}</div>
    </div>
  );
}

export function FigmaCtaButton({
  children,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      {...props}
      className={cn(
        "flex h-[49px] w-full items-center justify-center rounded-[16px] bg-[#FF9F43] px-3.5 py-[13px]",
        "text-[15px] leading-[22px] font-bold text-white",
        figmaShadowCta,
        "disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function FigmaFieldLabel({
  children,
  htmlFor,
  muted = "gray",
}: {
  children: ReactNode;
  htmlFor?: string;
  muted?: "gray" | "brown";
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "flex h-[18px] w-full items-center text-xs leading-[18px] font-semibold",
        muted === "brown" ? "text-[#8C8885]" : "text-[#AAAAAA]",
      )}
    >
      {children}
    </label>
  );
}

export function FigmaSheetHandle({ wide = false }: { wide?: boolean }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const startY = useRef(0);
  const dragged = useRef(false);
  const closed = useRef(false);

  function closeSheet() {
    if (closed.current) return;
    closed.current = true;
    closeRef.current?.click();
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    closed.current = false;
    dragged.current = false;
    startY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const dy = event.clientY - startY.current;
    if (dy > 10) dragged.current = true;
    if (dy > 56) closeSheet();
  }

  function onPointerUp() {
    if (!dragged.current) closeSheet();
  }

  return (
    <>
      <DialogClose ref={closeRef} className="sr-only" aria-hidden tabIndex={-1} />
      <button
        type="button"
        data-slot="sheet-handle"
        aria-label="닫기"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className={cn(
          "sticky top-0 z-20 flex w-full shrink-0 items-center justify-center bg-white pt-2 pb-0",
        )}
      >
        <span
          className={cn(
            wide ? "h-1 w-10 rounded-[2px] bg-[#EAE4D8]" : "h-1 w-9 rounded-[99px] bg-[#E0E0E0]",
          )}
        />
      </button>
    </>
  );
}

export function TicketPerforation({
  punchColor = "#FFFFFF",
}: {
  punchColor?: string;
}) {
  return (
    <div className="flex h-px w-full min-w-0 items-center" aria-hidden>
      <span className="size-4 shrink-0 rounded-full" style={{ background: punchColor }} />
      <span className="box-border h-[1.5px] flex-1 border-t-[1.5px] border-dashed border-[#DDDDDD]" />
      <span className="size-4 shrink-0 rounded-full" style={{ background: punchColor }} />
    </div>
  );
}

export function DragHandle({ label }: { label?: string }) {
  return (
    <div
      className="flex h-[18px] w-[22px] flex-col items-center justify-center gap-[3px] opacity-50"
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      <span className="h-[2px] w-[16px] rounded-[99px] bg-[#AAAAAA]" />
      <span className="h-[2px] w-[16px] rounded-[99px] bg-[#AAAAAA]" />
      <span className="h-[2px] w-[16px] rounded-[99px] bg-[#AAAAAA]" />
    </div>
  );
}

const ASSIGNEE_TONES = [
  "bg-[#FDDFE0] text-[#F29C9F]",
  "bg-[#D8EDF8] text-[#6BAED4]",
  "bg-[#E5F6D8] text-[#6AAA4F]",
  "bg-[#EDE4FF] text-[#8A6AD4]",
];

export function AssigneeBadge({ assignee }: { assignee?: string }) {
  const label = assignee?.trim() || "공통";
  const tone =
    label === "공통"
      ? "bg-[#FDF3D1] text-[#F3C65B]"
      : ASSIGNEE_TONES[[...label].reduce((sum, char) => sum + char.charCodeAt(0), 0) % ASSIGNEE_TONES.length];
  return (
    <span
      className={cn(
        "flex h-[23px] items-center rounded-lg px-2 py-[3px] text-[11px] leading-4 font-semibold",
        tone,
      )}
    >
      {label}
    </span>
  );
}
