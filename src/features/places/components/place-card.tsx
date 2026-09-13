import { IconAction } from "@/components/ui/icon-action";
import { IllustrationIcon } from "@/components/ui/illustration-icon";
import { cn } from "@/lib/utils";
import { PLACE_CATEGORY_ICON, PLACE_CATEGORY_TONE } from "@/lib/illustrations";
import type { Place } from "@/mocks/fixtures/places";

export function PlaceCard({
  place,
  selected,
  selectionMode,
  onToggleSelect,
  onDelete,
  onEdit,
  onLongPress,
}: {
  place: Place;
  selected?: boolean;
  selectionMode?: boolean;
  onToggleSelect?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onLongPress?: () => void;
}) {
  return (
    <div
      className="flex w-full flex-col items-start rounded-[20px] bg-white px-4 py-3.5 shadow-[0px_2px_12px_rgba(0,0,0,0.06)]"
      onClick={selectionMode ? onToggleSelect : undefined}
      onPointerDown={(e) => {
        if (selectionMode || !onLongPress) return;
        const timer = window.setTimeout(() => onLongPress(), 400);
        const clear = () => window.clearTimeout(timer);
        e.currentTarget.addEventListener("pointerup", clear, { once: true });
        e.currentTarget.addEventListener("pointerleave", clear, { once: true });
      }}
    >
      <div className="flex min-h-[67px] w-full items-center gap-3">
        {selectionMode && (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
            className="size-5 shrink-0"
            aria-label={`${place.name} 선택`}
          />
        )}
        <div
          className={cn(
            "flex size-[46px] shrink-0 items-center justify-center overflow-hidden rounded-2xl p-1.5",
            PLACE_CATEGORY_TONE[place.category].iconBg,
          )}
        >
          <IllustrationIcon src={PLACE_CATEGORY_ICON[place.category]} className="size-full" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <p className="block h-[23px] w-full truncate text-[15px] leading-[22px] font-bold text-[#1A1A1A]">
            {place.name}
          </p>
          {place.address ? (
            <p className="flex h-[17px] w-full items-center truncate text-[11px] leading-4 font-normal text-[#AAAAAA]">
              📍 {place.address}
            </p>
          ) : null}
          <div className="flex h-[23px] w-full items-start gap-1 pt-1">
            <span
              className={cn(
                "flex h-[19px] items-center rounded-[99px] px-2 py-0.5 text-[10px] leading-[15px] font-semibold text-[#555555]",
                PLACE_CATEGORY_TONE[place.category].chip,
              )}
            >
              {place.category}
            </span>
            {place.tags[0] ? (
              <span className="flex h-[19px] items-center rounded-[99px] bg-[#F5F5F5] px-2 py-0.5 text-[10px] leading-[15px] font-semibold text-[#555555]">
                {place.tags[0]}
              </span>
            ) : null}
          </div>
        </div>
        {!selectionMode && (
          <div className="flex h-[50px] w-[41px] shrink-0 flex-col items-center justify-center gap-[7px]">
            {onEdit && <IconAction action="edit" label={`${place.name} 수정`} onClick={onEdit} />}
            {onDelete && <IconAction action="delete" label={`${place.name} 삭제`} onClick={onDelete} />}
          </div>
        )}
      </div>
      {place.memo ? (
        <p
          title={place.memo}
          className="mt-2 w-full min-w-0 truncate text-[12px] leading-[18px] font-normal text-[#8C8885]"
        >
          {place.memo}
        </p>
      ) : null}
    </div>
  );
}
