import { FigmaChip, FigmaChipRow } from "@/components/ui/figma";
import { PLACE_CATEGORIES, type PlaceCategory } from "@/mocks/fixtures/places";

export type PlaceFilter = "전체" | PlaceCategory;
const FILTERS: PlaceFilter[] = ["전체", ...PLACE_CATEGORIES];

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
          {filter}
        </FigmaChip>
      ))}
    </FigmaChipRow>
  );
}
