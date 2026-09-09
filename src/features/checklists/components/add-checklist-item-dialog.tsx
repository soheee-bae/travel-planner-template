"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SoftChip, DashedAddButton } from "@/components/ui/soft-chip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateChecklistCategory, useCreateChecklistItem } from "@/features/checklists/hooks";
import type { ChecklistCategory } from "@/mocks/fixtures/checklists";

const FIGMA_CATEGORIES = [
  { name: "항공", icon: "✈️", aliases: ["항공", "예약 관련"] },
  { name: "숙소", icon: "🏨", aliases: ["숙소"] },
  { name: "짐싸기", icon: "🎒", aliases: ["짐싸기", "패킹리스트"] },
  { name: "예약", icon: "📅", aliases: ["예약"] },
  { name: "기타", icon: "📌", aliases: ["기타"] },
] as const;

const ASSIGNEES = ["공통", "소희", "준형"] as const;

function resolveCategory(
  categories: ChecklistCategory[],
  name: (typeof FIGMA_CATEGORIES)[number]["name"],
): ChecklistCategory | undefined {
  const preset = FIGMA_CATEGORIES.find((c) => c.name === name);
  return categories.find((c) => preset?.aliases.some((alias) => c.name.includes(alias)));
}

export function AddChecklistItemDialog({
  tripId,
  categories,
}: {
  tripId: string;
  categories: ChecklistCategory[];
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryName, setCategoryName] = useState<(typeof FIGMA_CATEGORIES)[number]["name"]>("항공");
  const [assignee, setAssignee] = useState<(typeof ASSIGNEES)[number]>("공통");
  const createCategory = useCreateChecklistCategory(tripId);
  const createItem = useCreateChecklistItem(tripId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    let category = resolveCategory(categories, categoryName);
    if (!category) {
      const preset = FIGMA_CATEGORIES.find((c) => c.name === categoryName);
      category = await createCategory.mutateAsync({
        tripId,
        name: categoryName,
        icon: preset?.icon ?? "📌",
        orderIndex: categories.length,
      });
    }

    createItem.mutate({
      tripId,
      categoryId: category.id,
      title: title.trim(),
      isChecked: false,
      notes: assignee,
      orderIndex: 0,
    });
    setTitle("");
    setContent("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DashedAddButton>+ 새 항목 추가</DashedAddButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>항목 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prep-item-name">항목 이름</Label>
            <Input
              id="prep-item-name"
              placeholder="예: 카메라 챙기기"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prep-item-body">내용 (선택)</Label>
            <Textarea
              id="prep-item-body"
              placeholder="추가 메모나 내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>카테고리</Label>
            <div className="flex flex-wrap gap-2">
              {FIGMA_CATEGORIES.map((c) => (
                <SoftChip key={c.name} active={categoryName === c.name} onClick={() => setCategoryName(c.name)}>
                  {c.name}
                </SoftChip>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>담당자</Label>
            <div className="flex flex-wrap gap-2">
              {ASSIGNEES.map((name) => (
                <SoftChip key={name} active={assignee === name} onClick={() => setAssignee(name)}>
                  {name}
                </SoftChip>
              ))}
            </div>
          </div>
          <Button type="submit" className="h-12 w-full rounded-full">
            저장하기
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
