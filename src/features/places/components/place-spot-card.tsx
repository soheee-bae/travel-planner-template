"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DragHandle } from "@/components/ui/figma";
import { IconAction } from "@/components/ui/icon-action";
import { IllustrationIcon } from "@/components/ui/illustration-icon";
import { PLACE_CATEGORY_ICON, PLACE_CATEGORY_TONE } from "@/lib/illustrations";
import { cn } from "@/lib/utils";
import type { Place } from "@/mocks/fixtures/places";

function stayLabel(min?: number): string | null {
  if (min == null || min <= 0) return null;
  const hours = Math.floor(min / 60);
  const minutes = min % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

type DragBind = {
  attributes: object;
  listeners?: object;
};

function HeaderRow({
  leading,
  trailing,
  children,
}: {
  leading?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full items-start gap-2.5">
      {leading}
      {children}
      {trailing}
    </div>
  );
}

export function PlaceSpotCard({
  place,
  selected,
  selectionMode,
  showDragHandle,
  dragBind,
  highlighted,
  className,
  onToggleSelect,
  onDelete,
  onEdit,
  onLongPress,
  onActivate,
}: {
  place: Place;
  selected?: boolean;
  selectionMode?: boolean;
  showDragHandle?: boolean;
  dragBind?: DragBind;
  highlighted?: boolean;
  className?: string;
  onToggleSelect?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onLongPress?: () => void;
  onActivate?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const time = stayLabel(place.durationMin);
  const canExpand = Boolean(place.memo || onEdit || onDelete);
  const showChevron = canExpand && !selectionMode;
  const showFooter = expanded && showChevron && Boolean(onEdit || onDelete);

  const leading = selectionMode ? (
    <input
      type="checkbox"
      checked={!!selected}
      onChange={onToggleSelect}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      className="size-5 shrink-0"
      aria-label={`${place.name} 선택`}
    />
  ) : showDragHandle ? (
    <button
      type="button"
      className="flex size-8 shrink-0 cursor-grab touch-none touch-callout-none items-center justify-center self-center rounded-lg active:cursor-grabbing"
      {...(dragBind?.attributes as ComponentProps<"button">)}
      {...(dragBind?.listeners as ComponentProps<"button"> | undefined)}
      aria-label={`${place.name} 순서 변경`}
      onClick={(event) => event.stopPropagation()}
    >
      <DragHandle label="" />
    </button>
  ) : null;

  const trailing = showChevron ? (
    <button
      type="button"
      className="flex size-8 shrink-0 items-center justify-center self-start rounded-lg text-[#C4C0BC]"
      aria-expanded={expanded}
      aria-label={expanded ? `${place.name} 접기` : `${place.name} 펼치기`}
      onClick={(event) => {
        event.stopPropagation();
        setExpanded((current) => !current);
      }}
    >
      {expanded ? <ChevronUp className="size-5" strokeWidth={2} /> : <ChevronDown className="size-5" strokeWidth={2} />}
    </button>
  ) : null;

  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-[24px] bg-white shadow-[0px_2px_12px_rgba(0,0,0,0.06)]",
        highlighted && "ring-2 ring-[#FF9F43]",
        className,
      )}
      onClick={selectionMode ? onToggleSelect : onActivate}
      onPointerDown={(event) => {
        if (selectionMode || !onLongPress) return;
        const timer = window.setTimeout(() => onLongPress(), 400);
        const clear = () => window.clearTimeout(timer);
        event.currentTarget.addEventListener("pointerup", clear, { once: true });
        event.currentTarget.addEventListener("pointerleave", clear, { once: true });
      }}
    >
      <div className="flex flex-col px-4 pt-3.5 pb-3.5">
        <HeaderRow leading={leading} trailing={trailing}>
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center self-start overflow-hidden rounded-[16px] p-1.5",
              PLACE_CATEGORY_TONE[place.category].iconBg,
            )}
          >
            <IllustrationIcon src={PLACE_CATEGORY_ICON[place.category]} className="size-full" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
            <p className="w-full truncate text-[16px] leading-[22px] font-bold text-[#1A1A1A]">{place.name}</p>
            {place.address ? (
              <p className="w-full truncate text-[12px] leading-[18px] font-normal text-[#B0AAA6]">{place.address}</p>
            ) : null}
            <div className="flex w-full min-w-0 items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex h-[19px] shrink-0 items-center rounded-[99px] px-2 py-0.5 text-[10px] leading-[15px] font-semibold text-[#555555]",
                  PLACE_CATEGORY_TONE[place.category].chip,
                )}
              >
                {place.category}
              </span>
              {time ? (
                <span className="min-w-0 truncate text-[12px] leading-[18px] font-normal text-[#C4C0BC]">{time}</span>
              ) : null}
            </div>
          </div>
        </HeaderRow>

        {expanded && showChevron && place.memo ? (
          <div className="flex h-auto w-full items-start gap-2.5 pt-2">
            {leading ? <span className="w-8 shrink-0" aria-hidden /> : null}
            <span className="w-11 shrink-0" aria-hidden />
            <p className="h-auto min-w-0 flex-1 whitespace-pre-wrap text-[13px] leading-[20px] font-normal text-[#4A4543]">
              {place.memo}
            </p>
            {trailing ? <span className="w-8 shrink-0" aria-hidden /> : null}
          </div>
        ) : null}
      </div>

      {showFooter ? (
        <div
          className="flex h-auto w-full items-center justify-end gap-0.5 border-t border-[#EFEFEF] px-3 py-0.5"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          {onEdit ? <IconAction action="edit" label={`${place.name} 수정`} onClick={onEdit} /> : null}
          {onDelete ? <IconAction action="delete" label={`${place.name} 삭제`} onClick={onDelete} /> : null}
        </div>
      ) : null}
    </div>
  );
}
