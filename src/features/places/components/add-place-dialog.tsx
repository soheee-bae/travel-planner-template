"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FigmaChip,
  FigmaChipRow,
  FigmaCtaButton,
  FigmaFieldLabel,
  FigmaSheetHandle,
  figmaInputClass,
  figmaTextareaClass,
} from "@/components/ui/figma";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreatePlace, useUpdatePlace } from "@/features/places/hooks";
import { IllustrationIcon } from "@/components/ui/illustration-icon";
import { PLACE_CATEGORY_ICON } from "@/lib/illustrations";
import {
  PLACE_CATEGORIES,
  type CreatePlaceInput,
  type Place,
  type PlaceCategory,
} from "@/mocks/fixtures/places";
import { formatDurationText, parseDurationText } from "@/lib/duration-text";
import { resolveTripDays } from "@/lib/trip-days";
import { nextOrderIndexForDay } from "@/lib/visit-order";

const formSchema = z.object({
  name: z.string().trim().min(1, "어딜 가볼까~?"),
  address: z.string().trim().min(1, "주소 안 넣으면 운전 안해!"),
  category: z.enum(PLACE_CATEGORIES),
  dayIndex: z.number().int().positive().nullable(),
  durationText: z
    .string()
    .optional()
    .refine((value) => !value?.trim() || parseDurationText(value) != null, {
      message: "1시간 30분, 90분, 1h 30m처럼 입력해 주세요",
    }),
  memo: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { lat?: number; lng?: number };
  if (typeof data.lat !== "number" || typeof data.lng !== "number") return null;
  if (!Number.isFinite(data.lat) || !Number.isFinite(data.lng)) return null;
  return { lat: data.lat, lng: data.lng };
}

function emptyForm(defaults?: { category?: PlaceCategory; dayIndex?: number | null }): FormValues {
  return {
    name: "",
    category: defaults?.category ?? "관광",
    address: "",
    dayIndex: defaults?.dayIndex ?? null,
    durationText: "",
    memo: "",
  };
}

export function AddPlaceDialog({
  tripId,
  initial,
  existingPlaces = [],
  hideTrigger,
  open: openProp,
  onOpenChange,
  startDate,
  endDate,
  defaultDayIndex,
  defaultCategory,
  onSaved,
  syncIdentityToIds = [],
}: {
  tripId: string;
  initial?: Place;
  existingTags?: string[];
  existingPlaces?: Place[];
  hideTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  startDate?: string;
  endDate?: string;
  defaultDayIndex?: number | null;
  defaultCategory?: PlaceCategory;
  onSaved?: (place: { dayIndex: number | null; category: PlaceCategory }) => void;
  syncIdentityToIds?: string[];
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const createPlace = useCreatePlace(tripId);
  const updatePlace = useUpdatePlace(tripId);
  const [geoError, setGeoError] = useState<string>();
  const [geoLoading, setGeoLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          category: initial.category,
          address: initial.address ?? "",
          dayIndex: initial.dayIndex,
          durationText: formatDurationText(initial.durationMin),
          memo: initial.memo ?? "",
        }
      : emptyForm({ category: defaultCategory, dayIndex: defaultDayIndex }),
  });
  const category = form.watch("category");
  const dayIndex = form.watch("dayIndex");
  const days = resolveTripDays(startDate, endDate);

  useEffect(() => {
    if (!open || initial) return;
    form.reset(emptyForm({ category: defaultCategory, dayIndex: defaultDayIndex }));
    // Defaults are captured when the sheet opens; `form` identity changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!initial) {
      form.reset(emptyForm({ category: defaultCategory, dayIndex: defaultDayIndex }));
    }
    if (!next) {
      setGeoError(undefined);
    }
  }

  async function onSubmit(values: FormValues) {
    setGeoError(undefined);
    const durationMin = parseDurationText(values.durationText);
    const addressUnchanged =
      initial != null && (initial.address ?? "").trim() === values.address.trim();
    let lat = addressUnchanged ? initial.lat : undefined;
    let lng = addressUnchanged ? initial.lng : undefined;

    if (lat == null || lng == null) {
      setGeoLoading(true);
      let coords: { lat: number; lng: number } | null = null;
      try {
        coords = await geocodeAddress(values.address);
      } catch {
        coords = null;
      } finally {
        setGeoLoading(false);
      }
      if (!coords) {
        setGeoError("주소를 지도에서 찾지 못했습니다. 주소를 다시 확인해 주세요.");
        return;
      }
      lat = coords.lat;
      lng = coords.lng;
    }

    const duplicate = existingPlaces.some(
      (p) =>
        p.id !== initial?.id &&
        p.name.trim() === values.name.trim() &&
        p.dayIndex != null &&
        p.dayIndex === (values.dayIndex ?? initial?.dayIndex ?? null),
    );
    if (duplicate && !window.confirm("같은 날 같은 이름 장소가 있습니다. 그래도 저장할까요?")) {
      return;
    }

    const memo = values.memo?.trim() ? values.memo : undefined;

    const nextDay = values.dayIndex;
    const dayChanged = initial != null && initial.dayIndex !== nextDay;
    const orderIndex =
      nextDay == null
        ? 0
        : dayChanged || initial == null
          ? nextOrderIndexForDay(existingPlaces, nextDay)
          : initial.orderIndex;

    if (initial) {
      updatePlace.mutate(
        {
          id: initial.id,
          patch: {
            name: values.name,
            address: values.address,
            category: values.category,
            durationMin: durationMin ?? null,
            memo: memo ?? null,
            lat,
            lng,
            dayIndex: nextDay,
            orderIndex,
          },
        },
        {
          onSuccess: () => {
            for (const id of syncIdentityToIds) {
              updatePlace.mutate({
                id,
                patch: {
                  name: values.name,
                  address: values.address,
                  category: values.category,
                  lat,
                  lng,
                },
              });
            }
            onSaved?.({ dayIndex: nextDay, category: values.category });
            setOpen(false);
          },
        },
      );
      return;
    }

    const input: CreatePlaceInput = {
      tripId,
      dayIndex: nextDay,
      orderIndex,
      tags: [],
      priority: "가능하면",
      name: values.name,
      address: values.address,
      category: values.category,
      durationMin,
      memo,
      lat,
      lng,
    };
    createPlace.mutate(input, {
      onSuccess: () => {
        onSaved?.({ dayIndex: nextDay, category: values.category });
        form.reset(emptyForm({ category: defaultCategory, dayIndex: defaultDayIndex }));
        setOpen(false);
      },
    });
  }

  const saving = geoLoading || createPlace.isPending || updatePlace.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!initial && !hideTrigger && (
        <DialogTrigger asChild>
          <FigmaCtaButton>+ 여기 가볼까?</FigmaCtaButton>
        </DialogTrigger>
      )}
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100%-48px)] gap-0 overflow-y-auto"
      >
        <FigmaSheetHandle />
        <DialogHeader className="gap-0">
          <DialogTitle className="flex h-[26px] items-center text-[17px] leading-[26px] font-bold text-[#1A1A1A]">
            {initial ? "장소 수정" : "어디 가볼까?"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col">
          <div className="flex flex-col gap-1.5 pt-5">
            <FigmaFieldLabel htmlFor="place-name">장소 이름</FigmaFieldLabel>
            <Input
              id="place-name"
              placeholder="바다 보면서 멍때릴 해변"
              aria-required="true"
              className={figmaInputClass}
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="text-[12px] leading-[18px] font-semibold text-[#E85D4C]">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5 pt-3.5">
            <FigmaFieldLabel htmlFor="place-address">주소</FigmaFieldLabel>
            <Input
              id="place-address"
              placeholder="네이버 지도 주소 복붙! (그래야 길 안 잃어 🚗)"
              aria-required="true"
              className={figmaInputClass}
              {...form.register("address")}
            />
            {form.formState.errors.address ? (
              <p className="text-[12px] leading-[18px] font-semibold text-[#E85D4C]">
                {form.formState.errors.address.message}
              </p>
            ) : null}
            {geoError ? (
              <p className="text-[12px] leading-[18px] font-semibold text-[#E85D4C]">{geoError}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 pt-3.5">
            <FigmaFieldLabel>카테고리</FigmaFieldLabel>
            <div className="flex w-full flex-wrap items-start gap-2 py-1" role="group" aria-label="카테고리">
              {PLACE_CATEGORIES.map((value) => (
                <FigmaChip
                  key={value}
                  size="sm"
                  className="h-8 gap-1.5 px-3"
                  active={category === value}
                  onClick={() => form.setValue("category", value, { shouldDirty: true })}
                >
                  <IllustrationIcon src={PLACE_CATEGORY_ICON[value]} className="size-5" />
                  {value}
                </FigmaChip>
              ))}
            </div>
          </div>
          <div className="flex flex-col pt-3.5">
            <FigmaFieldLabel>일차 (선택)</FigmaFieldLabel>
            <FigmaChipRow role="group" aria-label="일차">
              <FigmaChip
                size="sm"
                active={dayIndex == null}
                onClick={() => form.setValue("dayIndex", null, { shouldDirty: true })}
              >
                언젠가
              </FigmaChip>
              {days.map((day) => (
                <FigmaChip
                  key={day.dayIndex}
                  size="sm"
                  active={dayIndex === day.dayIndex}
                  onClick={() => form.setValue("dayIndex", day.dayIndex, { shouldDirty: true })}
                >
                  Day {day.dayIndex}
                </FigmaChip>
              ))}
            </FigmaChipRow>
          </div>
          <div className="flex flex-col gap-1.5 pt-3.5">
            <FigmaFieldLabel htmlFor="place-duration">예상 소요 시간 (선택)</FigmaFieldLabel>
            <Input
              id="place-duration"
              inputMode="text"
              placeholder="예: 해 질 때까지 멍때리기"
              className={figmaInputClass}
              {...form.register("durationText")}
            />
            {form.formState.errors.durationText ? (
              <p className="text-[12px] leading-[18px] font-semibold text-[#E85D4C]">
                {form.formState.errors.durationText.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5 py-3.5">
            <FigmaFieldLabel htmlFor="place-memo">메모 (선택)</FigmaFieldLabel>
            <Textarea
              id="place-memo"
              placeholder="예: 여기서 꼭 서로 사진 찍어주기 📸"
              className={figmaTextareaClass}
              {...form.register("memo")}
            />
          </div>

          <FigmaCtaButton type="submit" disabled={saving} className="h-[51px] py-3.5">
            {geoLoading ? "주소 찾는 중…" : "지도에 담기"}
          </FigmaCtaButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
