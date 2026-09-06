import { IconAction } from "@/components/ui/icon-action";
import type { Place } from "@/mocks/fixtures/places";

const CATEGORY_ICON: Record<Place["category"], string> = {
  관광: "🏛️",
  맛집: "🍽️",
  카페: "☕",
  쇼핑: "🛍️",
  액티비티: "🎢",
  기타: "📍",
};

const CATEGORY_TINT: Record<Place["category"], string> = {
  관광: "bg-[#E8F4FF]",
  맛집: "bg-[#FFE8EE]",
  카페: "bg-[#FFF1D6]",
  쇼핑: "bg-[#F3E9FE]",
  액티비티: "bg-[#E2FBE9]",
  기타: "bg-muted",
};

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
      className="flex items-center gap-3 rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border"
      onClick={selectionMode ? onToggleSelect : undefined}
      onPointerDown={(e) => {
        if (selectionMode || !onLongPress) return;
        const timer = window.setTimeout(() => onLongPress(), 400);
        const clear = () => window.clearTimeout(timer);
        e.currentTarget.addEventListener("pointerup", clear, { once: true });
        e.currentTarget.addEventListener("pointerleave", clear, { once: true });
      }}
    >
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
        className={`flex size-12 shrink-0 items-center justify-center rounded-2xl text-xl ${CATEGORY_TINT[place.category]}`}
      >
        {CATEGORY_ICON[place.category]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-bold text-foreground">{place.name}</p>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {place.category}
          </span>
        </div>
        {place.address ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{place.address}</p> : null}
        {place.tags.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {place.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {!selectionMode && (
        <div className="flex shrink-0 flex-col gap-0.5">
          {onEdit && <IconAction action="edit" label={`${place.name} 수정`} onClick={onEdit} />}
          {onDelete && <IconAction action="delete" label={`${place.name} 삭제`} onClick={onDelete} />}
        </div>
      )}
    </div>
  );
}
