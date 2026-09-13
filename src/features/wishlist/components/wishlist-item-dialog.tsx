"use client";

import { useEffect, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  FigmaCtaButton,
  FigmaFieldLabel,
  FigmaSheetHandle,
  figmaInputClass,
  figmaTextareaClass,
} from "@/components/ui/figma";
import { Glyph } from "@/components/ui/illustration-icon";
import { ILLUSTRATION, MEMO_ICONS, memoIconBg, resolveMemoIcon } from "@/lib/illustrations";
import { cn } from "@/lib/utils";
import { createWishlistItemInputSchema, type WishlistItem } from "@/mocks/fixtures/wishlist";
import { z } from "zod";

const DEFAULT_MEMO_ICON = ILLUSTRATION.memo;

const formSchema = createWishlistItemInputSchema.omit({ tripId: true, orderIndex: true }).extend({
  title: z
    .string()
    .trim()
    .min(1, "어떤걸 남겨볼래?")
    .max(2000, "제목이 너무 길어. 조금만 줄여줘!"),
});
type FormValues = z.infer<typeof formSchema>;

export function WishlistItemDialog({
  trigger,
  initial,
  onSubmit,
}: {
  trigger: ReactNode;
  initial?: WishlistItem;
  onSubmit: (values: FormValues) => void | Promise<void | unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      icon: resolveMemoIcon(initial?.icon ?? DEFAULT_MEMO_ICON),
      title: initial?.title ?? "",
      content: initial?.content ?? "",
    },
  });
  const selectedIcon = form.watch("icon");
  const titleError = form.formState.errors.title;

  useEffect(() => {
    if (!open) {
      setIconPickerOpen(false);
      setSubmitError(null);
      setSaving(false);
      return;
    }
    form.reset({
      icon: resolveMemoIcon(initial?.icon ?? DEFAULT_MEMO_ICON),
      title: initial?.title ?? "",
      content: initial?.content ?? "",
    });
    // Defaults are captured when the sheet opens; `form` identity changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleSubmit(values: FormValues) {
    setSubmitError(null);
    setSaving(true);
    try {
      await onSubmit(values);
      setOpen(false);
      if (!initial) form.reset({ icon: DEFAULT_MEMO_ICON, title: "", content: "" });
    } catch {
      setSubmitError("저장이 안 됐어. 다시 한 번 해볼래?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent showCloseButton={false} className="w-full max-w-none items-stretch gap-0">
        <FigmaSheetHandle wide />
        <DialogHeader className="w-full gap-0">
          <DialogTitle className="flex h-[27px] w-full items-center text-[18px] leading-[27px] font-bold text-[#4A4543]">
            끄적끄적 남기기
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex w-full flex-col gap-4 pt-4">
          <div className="flex w-full flex-col gap-1.5">
            <FigmaFieldLabel htmlFor="wish-title" muted="brown">
              제목
            </FigmaFieldLabel>
            <div className="flex w-full items-center gap-2">
              <button
                type="button"
                aria-label="아이콘 고르기"
                aria-expanded={iconPickerOpen}
                onClick={() => setIconPickerOpen((prev) => !prev)}
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-[14px] shadow-[0px_2px_12px_rgba(0,0,0,0.06)]",
                  memoIconBg(resolveMemoIcon(selectedIcon)),
                )}
              >
                <Glyph value={selectedIcon} className="size-7" />
              </button>
              <Input
                id="wish-title"
                placeholder="비 올 때 갈 실내 스팟"
                aria-required="true"
                aria-invalid={titleError ? true : undefined}
                className={figmaInputClass}
                {...form.register("title")}
              />
            </div>
            {iconPickerOpen ? (
              <div className="flex w-full flex-wrap gap-2" role="listbox" aria-label="아이콘">
                {MEMO_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    role="option"
                    aria-selected={resolveMemoIcon(selectedIcon) === icon}
                    onClick={() => {
                      form.setValue("icon", icon, { shouldDirty: true });
                      setIconPickerOpen(false);
                    }}
                    className={cn(
                      "flex size-12 items-center justify-center rounded-[14px] shadow-[0px_2px_12px_rgba(0,0,0,0.06)]",
                      memoIconBg(icon),
                      resolveMemoIcon(selectedIcon) === icon ? "ring-2 ring-[#FF9F43]" : "",
                    )}
                  >
                    <Glyph value={icon} className="size-7" />
                  </button>
                ))}
              </div>
            ) : null}
            {titleError ? (
              <p className="text-[12px] leading-[18px] font-semibold text-[#E85D4C]">{titleError.message}</p>
            ) : null}
          </div>
          <div className="flex w-full flex-col gap-1.5 pb-3.5">
            <FigmaFieldLabel htmlFor="wish-content" muted="brown">
              내용
            </FigmaFieldLabel>
            <Textarea
              id="wish-content"
              rows={5}
              placeholder="자유롭게 낙서하듯 끄적여줘!"
              className={figmaTextareaClass}
              {...form.register("content")}
            />
          </div>
          {submitError ? (
            <p className="text-[12px] leading-[18px] font-semibold text-[#E85D4C]">{submitError}</p>
          ) : null}
          <FigmaCtaButton type="submit" disabled={saving} className="rounded-[16px] py-[13px]">
            {saving ? "기억하는 중…" : "기억해두기"}
          </FigmaCtaButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
