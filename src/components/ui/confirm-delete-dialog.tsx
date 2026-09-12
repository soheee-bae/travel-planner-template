"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} variant="center" className="gap-5 overflow-visible p-5">
        <DialogHeader className="items-center">
          <DialogTitle className="w-full text-center text-[17px] leading-[26px] font-bold text-[#1A1A1A]">
            삭제하시겠습니까?
          </DialogTitle>
        </DialogHeader>
        <div className="flex w-full flex-row gap-2">
          <button
            type="button"
            className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#F5F5F5] text-[14px] font-semibold text-[#555555]"
            onClick={() => onOpenChange(false)}
          >
            취소
          </button>
          <button
            type="button"
            className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#FF9F43] text-[14px] font-semibold text-white"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            삭제
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useConfirmDelete(): {
  request: (action: () => void) => void;
  dialog: ReactNode;
} {
  const [open, setOpen] = useState(false);
  const actionRef = useRef<(() => void) | null>(null);
  const request = useCallback((action: () => void) => {
    actionRef.current = action;
    setOpen(true);
  }, []);

  return {
    request,
    dialog: (
      <ConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => {
          actionRef.current?.();
          actionRef.current = null;
        }}
      />
    ),
  };
}
