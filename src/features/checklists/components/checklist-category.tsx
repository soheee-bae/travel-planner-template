"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconAction } from "@/components/ui/icon-action";
import { Input } from "@/components/ui/input";
import { useConfirmDelete } from "@/components/ui/confirm-delete-dialog";
import { cn } from "@/lib/utils";
import {
  useCreateChecklistItem,
  useDeleteChecklistCategory,
  useDeleteChecklistItem,
  useUpdateChecklistCategory,
  useUpdateChecklistItem,
} from "@/features/checklists/hooks";
import type { ChecklistCategory, ChecklistItem } from "@/mocks/fixtures/checklists";
import { parseChecklistNotes } from "@/mocks/fixtures/checklists";

export function ChecklistCategorySection({
  tripId,
  category,
  items,
  onMoveUp,
  onMoveDown,
  manageable = true,
  showHeading = true,
  onEdit,
}: {
  tripId: string;
  category: ChecklistCategory;
  items: ChecklistItem[];
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  manageable?: boolean;
  showHeading?: boolean;
  onEdit?: (item: ChecklistItem) => void;
}) {
  const [newItemTitle, setNewItemTitle] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(category.name);
  const createItem = useCreateChecklistItem(tripId);
  const updateCategory = useUpdateChecklistCategory(tripId);
  const updateItem = useUpdateChecklistItem(tripId);
  const deleteItem = useDeleteChecklistItem(tripId);
  const deleteCategory = useDeleteChecklistCategory(tripId);
  const { request: askDelete, dialog: confirmDialog } = useConfirmDelete();

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    createItem.mutate({
      tripId,
      categoryId: category.id,
      title: newItemTitle.trim(),
      isChecked: false,
      notes: "공통",
      orderIndex: items.length,
    });
    setNewItemTitle("");
  }

  return (
    <section className="flex w-full flex-col items-start gap-2">
      {manageable || showHeading ? (
      <div className="flex w-full items-center justify-between">
        {manageable && editingName ? (
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
        ) : showHeading ? (
          <h2 className="flex h-5 items-center text-[13px] leading-5 font-bold tracking-[0.26px] text-[#AAAAAA]">
            {manageable ? `${category.icon} ${category.name}` : category.name}
          </h2>
        ) : (
          <span />
        )}
        {manageable ? (
          <>
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
              onClick={() => askDelete(() => deleteCategory.mutate(category.id))}
            />
          </>
        ) : null}
      </div>
      ) : null}

      <div className="flex w-full flex-col items-start gap-2">
        {items.map((item) => {
          const content = parseChecklistNotes(item.notes).content.trim();
          return (
            <div
              key={item.id}
              className="flex w-full items-start gap-2.5 rounded-[20px] bg-white px-3.5 py-3 shadow-[0px_2px_12px_rgba(0,0,0,0.06)]"
            >
              <span className="relative mt-0.5 flex size-[22px] shrink-0 items-center justify-center">
                <input
                  type="checkbox"
                  checked={item.isChecked}
                  onChange={(e) =>
                    updateItem.mutate({ id: item.id, patch: { isChecked: e.target.checked } })
                  }
                  className={cn(
                    "size-[22px] appearance-none rounded-[7px] border-2 border-[#DDDDDD]",
                    item.isChecked && "border-0 bg-[#FF9F43]",
                  )}
                  aria-label={`${item.title} 완료`}
                />
                {item.isChecked ? (
                  <span
                    className="pointer-events-none absolute text-[13px] leading-5 font-bold text-white"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                ) : null}
              </span>
              <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                <p
                  className={cn(
                    "line-clamp-2 w-full break-words text-[14px] leading-[21px] font-semibold",
                    item.isChecked ? "text-[#AAAAAA] line-through" : "text-[#4A4543]",
                  )}
                >
                  {item.title}
                </p>
                {content ? (
                  <p className="line-clamp-2 w-full break-words text-[11px] leading-4 text-[#AAAAAA]">
                    {content}
                  </p>
                ) : null}
              </div>
              <div className="flex h-[22px] shrink-0 items-center gap-0">
                {onEdit ? (
                  <IconAction
                    action="edit"
                    label={`${item.title} 수정`}
                    className="size-6"
                    onClick={() => onEdit(item)}
                  />
                ) : null}
                <IconAction
                  action="delete"
                  label={`${item.title} 삭제`}
                  className="size-6"
                  onClick={() => askDelete(() => deleteItem.mutate(item.id))}
                />
              </div>
            </div>
          );
        })}
      </div>

      {manageable ? (
        <form onSubmit={handleAddItem} className="flex w-full gap-2">
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
      ) : null}
      {confirmDialog}
    </section>
  );
}
