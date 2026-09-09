import { cn } from "@/lib/utils";
import type { PlaceCategory } from "@/mocks/fixtures/places";

export type PlaceFilter = "전체" | PlaceCategory;
const FILTERS: PlaceFilter[] = ["전체", "카페", "맛집", "관광", "쇼핑", "액티비티", "기타"];
const FILTER_LABEL: Record<PlaceFilter, string> = {
  전체: "전체",
  카페: "카페",
  맛집: "식당",
  관광: "관광",
  쇼핑: "쇼핑",
  액티비티: "액티비티",
  기타: "기타",
};

export function PlaceFilterBar({
  active,
  onChange,
  counts,
}: {
  active: PlaceFilter;
  onChange: (filter: PlaceFilter) => void;
  counts: Record<PlaceFilter, number>;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="카테고리 필터">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          role="tab"
          aria-selected={active === filter}
          onClick={() => onChange(filter)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap",
            active === filter
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {FILTER_LABEL[filter]}
        </button>
      ))}
    </div>
  );
}
