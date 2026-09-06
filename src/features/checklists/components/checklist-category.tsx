"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconAction } from "@/components/ui/icon-action";
import { Input } from "@/components/ui/input";
import {
  useCreateChecklistItem,
  useDeleteChecklistCategory,
  useDeleteChecklistItem,
  useUpdateChecklistCategory,
  useUpdateChecklistItem,
} from "@/features/checklists/hooks";
import type { ChecklistCategory, ChecklistItem } from "@/mocks/fixtures/checklists";

export function ChecklistCategorySection({
  tripId,
  category,
  items,
  onMoveUp,
  onMoveDown,
}: {
  tripId: string;
  category: ChecklistCategory;
  items: ChecklistItem[];
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [newItemTitle, setNewItemTitle] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(category.name);
  const createItem = useCreateChecklistItem(tripId);
  const updateCategory = useUpdateChecklistCategory(tripId);
  const updateItem = useUpdateChecklistItem(tripId);
  const deleteItem = useDeleteChecklistItem(tripId);
  const deleteCategory = useDeleteChecklistCategory(tripId);

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    createItem.mutate({
      tripId,
      categoryId: category.id,
      title: newItemTitle.trim(),
      isChecked: false,
      orderIndex: items.length,
    });
    setNewItemTitle("");
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        {editingName ? (
          <form
            className="flex flex-1 items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              updateCategory.mutate({ id: category.id, patch: { name: nameDraft.trim() } });
              setEditingName(false);
            }}
          >
            <Input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              aria-label="카테고리 이름"
              className="h-8"
            />
            <Button type="submit" size="sm">
              저장
            </Button>
          </form>
        ) : (
          <h2 className="text-sm font-semibold text-foreground">
            {category.icon} {category.name}
          </h2>
        )}
        {onMoveUp && (
          <Button size="sm" variant="ghost" onClick={onMoveUp} aria-label="위로">
            ↑
          </Button>
        )}
        {onMoveDown && (
          <Button size="sm" variant="ghost" onClick={onMoveDown} aria-label="아래로">
            ↓
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setEditingName(true)}
          aria-label={`${category.name} 이름 변경`}
        >
          이름
        </Button>
        <IconAction
          action="delete"
          label={`${category.name} 카테고리 삭제`}
          onClick={() => deleteCategory.mutate(category.id)}
        />
      </div>

      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2.5 text-sm shadow-sm ring-1 ring-border"
          >
            <input
              type="checkbox"
              checked={item.isChecked}
              onChange={(e) =>
                updateItem.mutate({ id: item.id, patch: { isChecked: e.target.checked } })
              }
              className="size-4"
            />
            <span
              className={
                item.isChecked
                  ? "flex-1 text-muted-foreground line-through"
                  : "flex-1 text-foreground"
              }
            >
              {item.title}
            </span>
            <IconAction
              action="delete"
              label={`${item.title} 삭제`}
              onClick={() => deleteItem.mutate(item.id)}
            />
          </label>
        ))}
      </div>

      <form onSubmit={handleAddItem} className="flex gap-2">
        <Input
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder="항목 추가"
          aria-label={`${category.name}에 항목 추가`}
          className="h-8"
        />
        <Button type="submit" size="sm" variant="outline" aria-label="추가">
          <Plus className="size-4" aria-hidden="true" />
        </Button>
      </form>
    </section>
  );
}
