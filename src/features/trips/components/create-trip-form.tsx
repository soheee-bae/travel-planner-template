"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTrip } from "@/features/trips/hooks";
import { createTripPeople } from "@/features/trips/people-api";
import { createTripInputSchema, type CreateTripInput } from "@/mocks/fixtures/trips";
import { formatDuration } from "@/lib/date";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/components/ui/date-range-picker";

const COMPANION_PRESETS = ["혼자", "커플", "친구들과", "가족과"] as const;
const COVER_EMOJIS = ["✈️", "🏯", "🌴", "🏖️", "🗻", "🎡", "🍜", "🏙️"] as const;

export function CreateTripForm() {
  const router = useRouter();
  const createTrip = useCreateTrip();
  const [customCompanion, setCustomCompanion] = useState(false);
  const [peopleNames, setPeopleNames] = useState("");

  const form = useForm<CreateTripInput>({
    resolver: zodResolver(createTripInputSchema),
    defaultValues: {
      title: "",
      destinationCountry: "KR",
      destinationCity: "",
      startDate: "",
      endDate: "",
      companions: "혼자",
      coverEmoji: "✈️",
      baseCurrency: "KRW",
    },
  });

  const startDate = useWatch({ control: form.control, name: "startDate" });
  const endDate = useWatch({ control: form.control, name: "endDate" });
  const companions = useWatch({ control: form.control, name: "companions" });

  function onSubmit(values: CreateTripInput) {
    createTrip.mutate(
      { ...values, destinationCountry: "KR", baseCurrency: "KRW" },
      {
        onSuccess: (trip) => {
          const names = peopleNames
            .split(/[,，]/)
            .map((name) => name.trim())
            .filter(Boolean);
          void createTripPeople(trip.id, names)
            .catch(() => undefined)
            .finally(() => {
              router.push(`/trips/${trip.id}`);
            });
        },
      },
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">여행 이름</Label>
        <Input id="title" placeholder="예: 오사카 여행" {...form.register("title")} />
        {form.formState.errors.title && (
          <p className="text-[12px] leading-[18px] font-semibold text-[#E85D4C]">이름은 공백 제외 2~30자로 입력해 주세요.</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="destinationCity">여행지</Label>
        <Input id="destinationCity" placeholder="예: 오사카" {...form.register("destinationCity")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>날짜</Label>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={(start, end) => {
            form.setValue("startDate", start, { shouldValidate: true });
            form.setValue("endDate", end, { shouldValidate: true });
          }}
        />
        <Input id="startDate" type="date" className="sr-only" {...form.register("startDate")} />
        <Input id="endDate" type="date" className="sr-only" {...form.register("endDate")} />
        {startDate && endDate && (
          <p className="text-sm text-muted-foreground">{formatDuration(startDate, endDate)}</p>
        )}
        {(form.formState.errors.startDate || form.formState.errors.endDate) && (
          <p className="text-[12px] leading-[18px] font-semibold text-[#E85D4C]">시작일과 종료일을 선택해 주세요.</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>누구랑?</Label>
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
                  ? "border-primary bg-accent text-accent-foreground"
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
              customCompanion
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border text-muted-foreground",
            )}
          >
            직접 입력
          </button>
        </div>
        {customCompanion && (
          <Input placeholder="예: 회사 동료들과" {...form.register("companions")} className="mt-1" />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="people">동행 이름</Label>
        <Input
          id="people"
          placeholder="예: Alex, Sam"
          value={peopleNames}
          onChange={(event) => setPeopleNames(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="coverEmoji">커버</Label>
        <Select
          defaultValue={form.getValues("coverEmoji")}
          onValueChange={(v) => form.setValue("coverEmoji", v)}
        >
          <SelectTrigger id="coverEmoji" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COVER_EMOJIS.map((emoji) => (
              <SelectItem key={emoji} value={emoji}>
                {emoji}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" size="lg" className="mt-2 h-11" disabled={createTrip.isPending}>
        {createTrip.isPending ? "만드는 중…" : "여행 만들기"}
      </Button>
    </form>
  );
}
