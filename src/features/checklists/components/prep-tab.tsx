"use client";

import { useEffect, useMemo, useState } from "react";
import { useChecklistCategories, useChecklistItems } from "@/features/checklists/hooks";
import { useTrip } from "@/features/trips/hooks";
import { ChecklistCategorySection } from "@/features/checklists/components/checklist-category";
import { IllustrationIcon } from "@/components/ui/illustration-icon";
import { FigmaChip, FigmaChipRow, FigmaPage, FigmaPageHeader, FigmaPageTitle } from "@/components/ui/figma";
import { ILLUSTRATION } from "@/lib/illustrations";
import { AddChecklistItemDialog } from "@/features/checklists/components/add-checklist-item-dialog";
import { PrepBodySkeleton, PrepPageSkeleton } from "@/components/ui/page-skeleton";
import {
  PREP_CATEGORIES,
  PREP_PAGE_FILTERS,
  canonicalPrepCategory,
  type ChecklistItem,
  type PrepCategoryName,
  type PrepPageFilter,
} from "@/mocks/fixtures/checklists";

function PrepProgressBar({ pct }: { pct: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(frame);
  }, [pct]);

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-[99px] bg-[#F0F0F0]">
      <div
        className="absolute inset-y-0 left-0 rounded-[99px] bg-[linear-gradient(90deg,#FF9F43_0%,#FF7F2A_100%)] transition-[width] duration-700 ease-out motion-reduce:transition-none"
        style={{ width: `${width}%` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

export function PrepTab({ tripId, embedded }: { tripId: string; embedded?: boolean }) {
  const { data: trip } = useTrip(tripId);
  const city = trip?.destinationCity || "여행지";
  const { data: categories, isLoading: loadingCategories } = useChecklistCategories(tripId);
  const { data: items, isLoading: loadingItems } = useChecklistItems(tripId);
  const [filter, setFilter] = useState<PrepPageFilter>("전체");
  const [editing, setEditing] = useState<ChecklistItem | null>(null);

  const { checkedCount, totalCount, pct } = useMemo(() => {
    const total = items?.length ?? 0;
    const checked = items?.filter((i) => i.isChecked).length ?? 0;
    return {
      checkedCount: checked,
      totalCount: total,
      pct: total > 0 ? Math.round((checked / total) * 100) : 0,
    };
  }, [items]);

  const grouped = useMemo(() => {
    const map = new Map<PrepCategoryName, ChecklistItem[]>();
    for (const preset of PREP_CATEGORIES) map.set(preset.name, []);
    for (const item of items ?? []) {
      const category = categories?.find((c) => c.id === item.categoryId);
      const name = category ? canonicalPrepCategory(category.name) : "기타";
      map.get(name)?.push(item);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.orderIndex - b.orderIndex);
    }
    return map;
  }, [items, categories]);

  const visibleGroups = useMemo(() => {
    if (filter === "전체") {
      return PREP_CATEGORIES.filter((preset) => (grouped.get(preset.name)?.length ?? 0) > 0);
    }
    return PREP_CATEGORIES.filter((preset) => preset.name === filter);
  }, [filter, grouped]);

  if (loadingCategories || loadingItems) {
    return embedded ? <PrepBodySkeleton /> : <PrepPageSkeleton />;
  }

  const body = (
    <>
      <FigmaChipRow role="tablist" aria-label="카테고리 필터">
        {PREP_PAGE_FILTERS.map((name) => (
          <FigmaChip
            key={name}
            role="tab"
            aria-selected={filter === name}
            active={filter === name}
            onClick={() => setFilter(name)}
          >
            {name}
          </FigmaChip>
        ))}
      </FigmaChipRow>
      <div className="flex w-full flex-col items-start gap-1.5 rounded-[20px] bg-white px-5 py-[18px] shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
        <div className="flex h-[34px] w-full items-center justify-between pb-1">
          <p className="flex min-h-[21px] items-center gap-1.5 text-[14px] leading-[21px] font-bold text-[#1A1A1A]">
            <IllustrationIcon src={ILLUSTRATION.battery} className="size-5" />
            {city} 준비 {pct}% 충전 완료
          </p>
          <p className="font-nunito text-[14px] leading-[21px] font-bold text-[#1A1A1A]">
            {checkedCount}/{totalCount}
            <span className="sr-only"> 완료</span>
          </p>
        </div>
        <PrepProgressBar pct={pct} />
        <p className="flex min-h-[17px] w-full items-center text-[11px] leading-4 text-[#AAAAAA]">
          다 안 채워도 돼, 쉬러 온 거니까
        </p>
      </div>

      <div className="flex w-full flex-col items-start gap-2.5">
        {visibleGroups.map((preset) => (
          <ChecklistCategorySection
            key={preset.name}
            tripId={tripId}
            category={{
              id: preset.name,
              tripId,
              name: preset.name,
              icon: preset.icon,
              orderIndex: 0,
            }}
            items={grouped.get(preset.name) ?? []}
            manageable={false}
            showHeading={filter === "전체"}
            onEdit={setEditing}
          />
        ))}
      </div>

      <AddChecklistItemDialog
        tripId={tripId}
        categories={categories ?? []}
        defaultCategory={filter === "전체" ? "맛집/카페" : filter}
        onSaved={(saved) => {
          setFilter(saved.category);
        }}
      />
      {editing ? (
        <AddChecklistItemDialog
          tripId={tripId}
          categories={categories ?? []}
          initial={editing}
          hideTrigger
          open
          onOpenChange={(next) => {
            if (!next) setEditing(null);
          }}
          onSaved={(saved) => {
            setFilter(saved.category);
            setEditing(null);
          }}
        />
      ) : null}
    </>
  );

  if (embedded) {
    return <div className="flex w-full flex-col items-start gap-4">{body}</div>;
  }

  return (
    <div className="flex flex-col bg-white">
      <FigmaPageHeader>
        <FigmaPageTitle>{`${city}에서 슬쩍 하고 싶은 것들`}</FigmaPageTitle>
      </FigmaPageHeader>
      <FigmaPage>{body}</FigmaPage>
    </div>
  );
}
