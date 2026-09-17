"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FigmaPage, FigmaPageHeader, FigmaPageScroll, FigmaPageTitle, figmaShadowCard } from "@/components/ui/figma";
import { useConfirmDelete } from "@/components/ui/confirm-delete-dialog";
import { ListPageSkeleton } from "@/components/ui/page-skeleton";
import { usePlaces, useDeletePlace } from "@/features/places/hooks";
import { PlaceCard } from "@/features/places/components/place-card";
import { PlaceFilterBar, type PlaceFilter } from "@/features/places/components/place-filter-bar";
import { AddPlaceDialog } from "@/features/places/components/add-place-dialog";
import { cn } from "@/lib/utils";
import type { Trip } from "@/mocks/fixtures/trips";
import { PLACE_CATEGORIES, type Place } from "@/mocks/fixtures/places";
import { assignedDaysOf, groupedSpots } from "@/lib/visit-order";

export function PlacesTab({ trip }: { trip: Trip }) {
  const tripId = trip.id;
  const { data: places, isLoading, isError } = usePlaces(tripId);
  const deletePlace = useDeletePlace(tripId);
  const { request: askDelete, dialog: confirmDialog } = useConfirmDelete();
  const [filter, setFilter] = useState<PlaceFilter>("전체");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Place | null>(null);
  const [query, setQuery] = useState("");

  const groups = useMemo(() => groupedSpots(places ?? []), [places]);

  const counts = useMemo(() => {
    const base = {
      전체: groups.length,
    } as Record<PlaceFilter, number>;
    for (const category of PLACE_CATEGORIES) base[category] = 0;
    for (const group of groups) base[group.representative.category] += 1;
    return base;
  }, [groups]);

  const filtered = useMemo(() => {
    return groups.filter((group) => {
      if (filter !== "전체" && group.representative.category !== filter) return false;
      return query.trim() ? group.representative.name.includes(query.trim()) : true;
    });
  }, [groups, filter, query]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelected(new Set());
  }

  function handleBulkDelete() {
    for (const id of selected) {
      const group = groups.find((item) => item.representative.id === id);
      (group?.members ?? []).forEach((member) => deletePlace.mutate(member.id));
    }
    exitSelectionMode();
  }

  if (isLoading) return <ListPageSkeleton />;
  if (isError)
    return (
      <p className="p-6 text-[12px] leading-[18px] font-semibold text-[#E85D4C]">
        장소 목록을 다시 불러와 주세요.
      </p>
    );

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <FigmaPageHeader>
        <div className="flex w-full items-center justify-between">
          <FigmaPageTitle className="w-auto flex-1">가보고 싶은 스팟 모음</FigmaPageTitle>
          <button
            type="button"
            className="shrink-0 text-[13px] leading-5 font-semibold text-[#8C8885]"
            aria-pressed={selectionMode}
            onClick={() => {
              if (selectionMode) exitSelectionMode();
              else setSelectionMode(true);
            }}
          >
            {selectionMode ? "취소" : "선택"}
          </button>
        </div>
      </FigmaPageHeader>
      <FigmaPageScroll>
      <FigmaPage>
        <div
          className={cn(
            "flex h-10 w-full items-center gap-2.5 rounded-[20px] bg-white px-4 py-[11px]",
            figmaShadowCard,
          )}
        >
          <Search className="size-[21px] shrink-0 opacity-40" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="장소 검색..."
            aria-label="장소 검색"
            className="h-[18px] min-w-0 flex-1 bg-transparent text-[14px] leading-[17px] text-[#1A1A1A] outline-none placeholder:text-[rgba(26,26,26,0.5)]"
          />
        </div>
        <PlaceFilterBar active={filter} onChange={setFilter} counts={counts} />

        {selectionMode ? (
          <div className="flex w-full items-center justify-between">
            <span className="text-[13px] leading-5 text-[#8E8E8E]" aria-live="polite">
              {selected.size}개 선택됨
            </span>
            <button
              type="button"
              disabled={selected.size === 0}
              className="text-[13px] leading-5 font-semibold text-[#E25C5C] disabled:opacity-40"
              onClick={() => askDelete(handleBulkDelete)}
            >
              삭제
            </button>
          </div>
        ) : null}

        {filtered.length === 0 && (
          <p className="w-full py-6 text-center text-[13px] leading-5 text-[#8E8E8E]">
            탐색 중... 맛있는 냄새 찾는 중 🍜
          </p>
        )}

        <div className="flex w-full flex-col items-start gap-2.5">
          {filtered.map((group) => {
            const place = group.representative;
            const memberIds = group.members.map((member) => member.id);
            const days = assignedDaysOf(group.members);
            return (
              <PlaceCard
                key={place.id}
                place={place}
                assignedDays={days.length > 1 ? days : undefined}
                selectionMode={selectionMode}
                selected={selected.has(place.id)}
                onToggleSelect={() => toggleSelect(place.id)}
                onDelete={() =>
                  askDelete(() => {
                    memberIds.forEach((id) => deletePlace.mutate(id));
                  })
                }
                onEdit={() => setEditing(place)}
                onLongPress={() => {
                  setSelectionMode(true);
                  toggleSelect(place.id);
                }}
              />
            );
          })}
        </div>
        <AddPlaceDialog
          tripId={tripId}
          startDate={trip.startDate}
          endDate={trip.endDate}
          existingPlaces={places ?? []}
          defaultCategory={filter === "전체" ? undefined : filter}
          onSaved={(saved) => {
            setFilter(saved.category);
          }}
        />
        {editing && (
          <AddPlaceDialog
            tripId={tripId}
            startDate={trip.startDate}
            endDate={trip.endDate}
            initial={editing}
            existingPlaces={places ?? []}
            syncIdentityToIds={
              groups
                .find((group) => group.members.some((member) => member.id === editing.id))
                ?.members.filter((member) => member.id !== editing.id)
                .map((member) => member.id) ?? []
            }
            open
            onOpenChange={(next) => {
              if (!next) setEditing(null);
            }}
          />
        )}
        {confirmDialog}
      </FigmaPage>
      </FigmaPageScroll>
    </div>
  );
}
