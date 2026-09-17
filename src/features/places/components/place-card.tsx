"use client";

import { PlaceSpotCard } from "@/features/places/components/place-spot-card";
import type { Place } from "@/mocks/fixtures/places";

export function PlaceCard({
  place,
  assignedDays,
  selected,
  selectionMode,
  onToggleSelect,
  onDelete,
  onEdit,
  onLongPress,
}: {
  place: Place;
  assignedDays?: number[];
  selected?: boolean;
  selectionMode?: boolean;
  onToggleSelect?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onLongPress?: () => void;
}) {
  return (
    <PlaceSpotCard
      place={place}
      assignedDays={assignedDays}
      selected={selected}
      selectionMode={selectionMode}
      onToggleSelect={onToggleSelect}
      onDelete={onDelete}
      onEdit={onEdit}
      onLongPress={onLongPress}
    />
  );
}
