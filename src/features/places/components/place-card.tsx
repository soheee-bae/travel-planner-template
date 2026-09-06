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

const PRIORITY_BADGE: Record<Place["priority"], string> = {
  필수: "⭐ 필수",
  가능하면: "",
  시간되면: "",
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
      className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm"
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
          // 카드 전체가 이미 toggle을 처리한다 — 버블링으로 두 번 토글되는
          // 것을 막는다 (클릭 한 번 = 토글 한 번).
          onClick={(e) => e.stopPropagation()}
          className="size-5 shrink-0"
          aria-label={`${place.name} 선택`}
        />
      )}
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">{place.name}</p>
          <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {place.dayIndex ? `Day${place.dayIndex}` : "미정"}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">
            {CATEGORY_ICON[place.category]} {place.category}
          </span>
          {place.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {PRIORITY_BADGE[place.priority] && `${PRIORITY_BADGE[place.priority]} · `}
          {place.address && `📍 ${place.address} · `}
          {place.estimatedCost != null &&
            `${place.costCurrency ?? ""} ${place.estimatedCost.toLocaleString()}`}
        </p>
        {place.memo && <p className="text-xs text-muted-foreground">{place.memo}</p>}
      </div>
      {!selectionMode && (
        <div className="flex shrink-0 flex-col gap-1">
          {onEdit && <IconAction action="edit" label={`${place.name} 수정`} onClick={onEdit} />}
          {onDelete && <IconAction action="delete" label={`${place.name} 삭제`} onClick={onDelete} />}
        </div>
      )}
    </div>
  );
}
