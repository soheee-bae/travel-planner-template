"use client";

import { PlaceSpotCard } from "@/features/places/components/place-spot-card";
import type { Place } from "@/mocks/fixtures/places";

export function PlaceCard({
  place,
  selected,
  selectionMode,
  onToggleSelect,
  onDelete,
  onEdit,
  onLongPress,
}: {
  place: Place;
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
      selected={selected}
      selectionMode={selectionMode}
      onToggleSelect={onToggleSelect}
      onDelete={onDelete}
      onEdit={onEdit}
      onLongPress={onLongPress}
    />
  );
}
