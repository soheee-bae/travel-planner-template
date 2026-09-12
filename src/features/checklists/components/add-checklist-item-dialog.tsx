"use client";

import { useEffect, useState } from "react";
import {
  FigmaChip,
  FigmaCtaButton,
  FigmaFieldLabel,
  FigmaSheetHandle,
  figmaInputClass,
  figmaTextareaClass,
} from "@/components/ui/figma";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useCreateChecklistCategory,
  useCreateChecklistItem,
  useUpdateChecklistItem,
} from "@/features/checklists/hooks";
import {
  PREP_CATEGORIES,
  canonicalPrepCategory,
  formatChecklistNotes,
  parseChecklistNotes,
  type ChecklistCategory,
  type ChecklistItem,
  type PrepCategoryName,
} from "@/mocks/fixtures/checklists";

function resolveCategory(
  categories: ChecklistCategory[],
  name: PrepCategoryName,
): ChecklistCategory | undefined {
  return (
    categories.find((c) => c.name === name) ??
    categories.find((c) => canonicalPrepCategory(c.name) === name)
  );
}

export function AddChecklistItemDialog({
  tripId,
  categories,
  defaultCategory,
  initial,
  hideTrigger,
  open: openProp,
  onOpenChange,
  onSaved,
}: {
  tripId: string;
  categories: ChecklistCategory[];
  defaultCategory?: PrepCategoryName;
  initial?: ChecklistItem;
  hideTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaved?: (saved: { category: PrepCategoryName }) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [titleError, setTitleError] = useState<string>();
  const [categoryName, setCategoryName] = useState<PrepCategoryName>(defaultCategory ?? "맛집/카페");
  const createCategory = useCreateChecklistCategory(tripId);
  const createItem = useCreateChecklistItem(tripId);
  const updateItem = useUpdateChecklistItem(tripId);

  useEffect(() => {
    if (!open) return;
    setTitleError(undefined);
    if (initial) {
      const initialCategory = categories.find((c) => c.id === initial.categoryId);
      setTitle(initial.title);
      setContent(parseChecklistNotes(initial.notes).content);
      setCategoryName(initialCategory ? canonicalPrepCategory(initialCategory.name) : "맛집/카페");
      return;
    }
    setTitle("");
    setContent("");
    setCategoryName(defaultCategory ?? "맛집/카페");
  }, [open, defaultCategory, initial, categories]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError("제주도에서 뭐 하고 싶어?");
      return;
    }

    let category = resolveCategory(categories, categoryName);
    if (!category) {
      const preset = PREP_CATEGORIES.find((c) => c.name === categoryName);
      category = await createCategory.mutateAsync({
        tripId,
        name: categoryName,
        icon: preset?.icon ?? "🎸",
        orderIndex: categories.length,
      });
    }

    const notes = formatChecklistNotes(content);
    if (initial) {
      updateItem.mutate(
        {
          id: initial.id,
          patch: { title: title.trim(), notes: notes ?? "", categoryId: category.id },
        },
        {
          onSuccess: () => {
            onSaved?.({ category: categoryName });
            setOpen(false);
          },
        },
      );
      return;
    }

    createItem.mutate(
      {
        tripId,
        categoryId: category.id,
        title: title.trim(),
        isChecked: false,
        notes,
        orderIndex: 0,
      },
      {
        onSuccess: () => {
          onSaved?.({ category: categoryName });
          setTitle("");
          setContent("");
          setTitleError(undefined);
          setOpen(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!initial && !hideTrigger ? (
        <DialogTrigger asChild>
          <FigmaCtaButton>+ 슬쩍 추가하기</FigmaCtaButton>
        </DialogTrigger>
      ) : null}
      <DialogContent showCloseButton={false} className="w-full max-w-none items-stretch gap-0">
        <FigmaSheetHandle wide />
        <DialogHeader className="w-full gap-0">
          <DialogTitle className="flex h-[27px] w-full items-center text-[18px] leading-[27px] font-bold text-[#4A4543]">
            {initial ? "항목 수정" : "슬쩍 해볼까?"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 pt-4">
          <div className="flex w-full flex-col gap-1.5">
            <FigmaFieldLabel htmlFor="prep-item-name" muted="brown">
              항목 이름
            </FigmaFieldLabel>
            <Input
              id="prep-item-name"
              placeholder="예) 고등어회 와구와구 먹기"
              aria-required="true"
              aria-invalid={titleError ? true : undefined}
              className={figmaInputClass}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(undefined);
              }}
            />
            {titleError ? (
              <p className="text-[12px] leading-[18px] text-destructive">{titleError}</p>
            ) : null}
          </div>
          <div className="flex w-full flex-col gap-1.5">
            <FigmaFieldLabel htmlFor="prep-item-body" muted="brown">
              내용 (선택)
            </FigmaFieldLabel>
            <Textarea
              id="prep-item-body"
              placeholder="위치(애월, 서귀포 등)나 지도 링크, 메모(웨이팅 필수 등)"
              className={figmaTextareaClass}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="flex w-full flex-col gap-2">
            <FigmaFieldLabel muted="brown">카테고리</FigmaFieldLabel>
            <div className="flex w-full flex-wrap gap-2">
              {PREP_CATEGORIES.map((c) => (
                <FigmaChip
                  key={c.name}
                  size="sm"
                  active={categoryName === c.name}
                  onClick={() => setCategoryName(c.name)}
                >
                  {c.icon} {c.name}
                </FigmaChip>
              ))}
            </div>
          </div>
          <FigmaCtaButton type="submit" className="rounded-[16px]">
            리스트에 담기
          </FigmaCtaButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
