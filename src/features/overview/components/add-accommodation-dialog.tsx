"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Plus } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateAccommodation, useUpdateAccommodation } from "@/features/overview/hooks";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MoneyInput } from "@/components/ui/money-input";
import {
  createAccommodationInputSchema,
  type Accommodation,
  type CreateAccommodationInput,
} from "@/mocks/fixtures/overview";

const formSchema = createAccommodationInputSchema.omit({ tripId: true });
type FormValues = z.infer<typeof formSchema>;

export function AddAccommodationDialog({
  tripId,
  tripStartDate,
  tripEndDate,
  initial,
  open: openProp,
  onOpenChange,
}: {
  tripId: string;
  tripStartDate?: string;
  tripEndDate?: string;
  initial?: Accommodation;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const createAccommodation = useCreateAccommodation(tripId);
  const updateAccommodation = useUpdateAccommodation(tripId);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          checkinDate: initial.checkinDate,
          checkoutDate: initial.checkoutDate,
          checkinTime: initial.checkinTime,
          checkoutTime: initial.checkoutTime,
          cost: initial.cost,
        }
      : { name: "", checkinDate: "", checkoutDate: "" },
  });

  const checkinDate = useWatch({ control: form.control, name: "checkinDate" });
  const checkoutDate = useWatch({ control: form.control, name: "checkoutDate" });
  const outsideTrip =
    tripStartDate &&
    tripEndDate &&
    checkinDate &&
    checkoutDate &&
    (checkinDate < tripStartDate || checkoutDate > tripEndDate);

  function onSubmit(values: FormValues) {
    if (values.checkoutDate && values.checkinDate && values.checkoutDate < values.checkinDate) {
      return;
    }
    if (initial) {
      updateAccommodation.mutate(
        { id: initial.id, patch: values },
        { onSuccess: () => setOpen(false) },
      );
      return;
    }
    const input: CreateAccommodationInput = { tripId, ...values };
    createAccommodation.mutate(input, { onSuccess: () => setOpen(false) });
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!initial && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="size-4" aria-hidden="true" />
            숙소 추가
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "숙소 수정" : "숙소 추가"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="acc-name">숙소명</Label>
            <Input id="acc-name" placeholder="예: 제주 신라호텔" {...form.register("name")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>체크인 ~ 체크아웃</Label>
            <DateRangePicker
              startDate={checkinDate}
              endDate={checkoutDate}
              onChange={(start, end) => {
                form.setValue("checkinDate", start, { shouldValidate: true });
                form.setValue("checkoutDate", end, { shouldValidate: true });
              }}
            />
            {checkoutDate && checkinDate && checkoutDate < checkinDate && (
              <p className="text-[12px] leading-[18px] font-semibold text-[#E85D4C]">체크아웃은 체크인 이후여야 해.</p>
            )}
            {outsideTrip && (
              <p className="text-[12px] leading-[18px] font-semibold text-[#E85D4C]">여행 기간 밖 숙소입니다. 날짜를 확인해 주세요.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="acc-checkin-time">체크인 시간</Label>
              <Input id="acc-checkin-time" type="time" {...form.register("checkinTime")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="acc-checkout-time">체크아웃 시간</Label>
              <Input id="acc-checkout-time" type="time" {...form.register("checkoutTime")} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="acc-cost">비용</Label>
            <Controller
              control={form.control}
              name="cost"
              render={({ field }) => (
                <MoneyInput id="acc-cost" value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
          <Button
            type="submit"
            className="h-10"
            disabled={createAccommodation.isPending || updateAccommodation.isPending}
          >
            {initial ? "저장" : "추가"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
