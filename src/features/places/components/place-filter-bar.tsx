import { FigmaChip, FigmaChipRow } from "@/components/ui/figma";
import type { PlaceCategory } from "@/mocks/fixtures/places";

export type PlaceFilter = "전체" | PlaceCategory;
const FILTERS: PlaceFilter[] = ["전체", "관광", "맛집", "카페", "숙소", "교통", "쇼핑", "기타"];
const FILTER_LABEL: Record<PlaceFilter, string> = {
  전체: "전체",
  관광: "관광",
  맛집: "맛집",
  카페: "카페",
  숙소: "숙소",
  교통: "교통",
  쇼핑: "쇼핑",
  기타: "기타",
};

export function PlaceFilterBar({
  active,
  onChange,
}: {
  active: PlaceFilter;
  onChange: (filter: PlaceFilter) => void;
  counts: Record<PlaceFilter, number>;
}) {
  return (
    <FigmaChipRow role="tablist" aria-label="카테고리 필터">
      {FILTERS.map((filter) => (
        <FigmaChip
          key={filter}
          role="tab"
          aria-selected={active === filter}
          active={active === filter}
          onClick={() => onChange(filter)}
        >
          {FILTER_LABEL[filter]}
        </FigmaChip>
      ))}
    </FigmaChipRow>
  );
}
