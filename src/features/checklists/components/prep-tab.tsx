"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useChecklistCategories,
  useChecklistItems,
  useCreateChecklistCategory,
  useUpdateChecklistCategory,
} from "@/features/checklists/hooks";
import { ChecklistCategorySection } from "@/features/checklists/components/checklist-category";
import { CHECKLIST_RECOMMENDED_CATEGORIES } from "@/mocks/fixtures/checklists";
import { SoftChip, EndMascot } from "@/components/ui/soft-chip";

export function PrepTab({ tripId, embedded }: { tripId: string; embedded?: boolean }) {
  const { data: categories, isLoading: loadingCategories } = useChecklistCategories(tripId);
  const { data: items, isLoading: loadingItems } = useChecklistItems(tripId);
  const createCategory = useCreateChecklistCategory(tripId);
  const updateCategory = useUpdateChecklistCategory(tripId);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [assignee, setAssignee] = useState<"전체" | "공통" | "소희" | "준형">("전체");

  const { checkedCount, totalCount, pct } = useMemo(() => {
    const total = items?.length ?? 0;
    const checked = items?.filter((i) => i.isChecked).length ?? 0;
    return {
      checkedCount: checked,
      totalCount: total,
      pct: total > 0 ? Math.round((checked / total) * 100) : 0,
    };
  }, [items]);

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    createCategory.mutate({
      tripId,
      name: newCategoryName.trim(),
      icon: "📌",
      orderIndex: categories?.length ?? 0,
    });
    setNewCategoryName("");
  }

  if (loadingCategories || loadingItems) {
    return <p className="p-6 text-sm text-muted-foreground">불러오는 중…</p>;
  }

  return (
    <div className={embedded ? "flex flex-col gap-5" : "mx-auto flex w-full flex-col gap-5 p-4"}>
      <div className="flex gap-2 overflow-x-auto">
        {(["전체", "공통", "소희", "준형"] as const).map((name) => (
          <SoftChip key={name} active={assignee === name} onClick={() => setAssignee(name)}>
            {name}
          </SoftChip>
        ))}
      </div>
      <div className="rounded-[20px] bg-[#FFF8EE] p-4 ring-1 ring-[#FFE0BC]">
        <p className="text-sm font-bold text-[#1A1A1A]">🎒 준비 현황</p>
        <p className="mt-1 font-heading text-2xl font-bold text-[#FF9F43]">
          {checkedCount}/{totalCount}
        </p>
        <p className="text-xs text-[#8C8885]">
          {pct}% 완료 · {checkedCount}/{totalCount} 완료
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#F0EDE8]">
          <div
            className="h-full rounded-full bg-[#FF9F43] transition-[width]"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {categories
        ?.slice()
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((category, index, list) => (
          <ChecklistCategorySection
            key={category.id}
            tripId={tripId}
            category={category}
            items={(items ?? [])
              .filter((i) => i.categoryId === category.id)
              .filter((i) => {
                if (assignee === "전체") return true;
                const tag = i.notes ?? "공통";
                return tag === assignee;
              })
              .sort((a, b) => a.orderIndex - b.orderIndex)}
            onMoveUp={
              index > 0
                ? () => {
                    const prev = list[index - 1];
                    updateCategory.mutate({
                      id: category.id,
                      patch: { orderIndex: prev.orderIndex },
                    });
                    updateCategory.mutate({
                      id: prev.id,
                      patch: { orderIndex: category.orderIndex },
                    });
                  }
                : undefined
            }
            onMoveDown={
              index < list.length - 1
                ? () => {
                    const next = list[index + 1];
                    updateCategory.mutate({
                      id: category.id,
                      patch: { orderIndex: next.orderIndex },
                    });
                    updateCategory.mutate({
                      id: next.id,
                      patch: { orderIndex: category.orderIndex },
                    });
                  }
                : undefined
            }
          />
        ))}

      <form onSubmit={handleAddCategory} className="flex gap-2">
        <Input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="새 카테고리 이름"
          aria-label="새 카테고리 이름"
          className="h-9"
        />
        <Button type="submit" size="sm" className="gap-1">
          <Plus className="size-4" aria-hidden="true" />
          추가
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">💡 기본 카테고리 추가하기</p>
        <div className="flex flex-wrap gap-2">
          {CHECKLIST_RECOMMENDED_CATEGORIES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() =>
                createCategory.mutate({
                  tripId,
                  name: preset.name,
                  icon: preset.icon,
                  orderIndex: categories?.length ?? 0,
                })
              }
              className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground"
            >
              {preset.icon} {preset.name}
            </button>
          ))}
        </div>
      </div>
      <EndMascot />
    </div>
  );
}
