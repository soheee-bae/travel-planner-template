"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUpdateTrip } from "@/features/trips/hooks";
import { createTripInputSchema, type CreateTripInput, type Trip } from "@/mocks/fixtures/trips";
import { formatDuration } from "@/lib/date";
import { cn } from "@/lib/utils";

const COMPANION_PRESETS = ["혼자", "커플", "친구들과", "가족과"] as const;

export function EditTripDialog({
  trip,
  open,
  onOpenChange,
}: {
  trip: Trip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateTrip = useUpdateTrip(trip.id);
  const [customCompanion, setCustomCompanion] = useState(
    !COMPANION_PRESETS.includes(trip.companions as (typeof COMPANION_PRESETS)[number]),
  );
  const form = useForm<CreateTripInput>({
    resolver: zodResolver(createTripInputSchema),
    defaultValues: { ...trip, destinationCountry: "KR", baseCurrency: "KRW" },
  });
  const startDate = useWatch({ control: form.control, name: "startDate" });
  const endDate = useWatch({ control: form.control, name: "endDate" });
  const companions = useWatch({ control: form.control, name: "companions" });

  function onSubmit(values: CreateTripInput) {
    updateTrip.mutate(
      { ...values, destinationCountry: "KR", baseCurrency: "KRW" },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>여행 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-title">여행 이름</Label>
            <Input id="edit-title" {...form.register("title")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-city">여행지</Label>
            <Input id="edit-city" {...form.register("destinationCity")} />
          </div>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(start, end) => {
              form.setValue("startDate", start, { shouldValidate: true });
              form.setValue("endDate", end, { shouldValidate: true });
            }}
          />
          {startDate && endDate && (
            <p className="text-sm text-muted-foreground">{formatDuration(startDate, endDate)}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {COMPANION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setCustomCompanion(false);
                  form.setValue("companions", preset);
                }}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm",
                  !customCompanion && companions === preset
                    ? "border-primary bg-accent"
                    : "border-border text-muted-foreground",
                )}
              >
                {preset}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCustomCompanion(true)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm",
                customCompanion ? "border-primary bg-accent" : "border-border text-muted-foreground",
              )}
            >
              직접 입력
            </button>
          </div>
          {customCompanion && <Input {...form.register("companions")} />}
          <Button type="submit" className="h-10" disabled={updateTrip.isPending}>
            저장
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
