import { createClient } from "@/lib/supabase/client";
import { asNumber, asRequiredNumber, throwIfError, throwIfWriteError } from "@/lib/supabase/throw";
import { toClientTripId, toDbTripId } from "@/lib/trip-ids";
import { normalizePlaceCategory, type CreatePlaceInput, type Place, type PlacePriority, type UpdatePlaceInput } from "@/mocks/fixtures/places";

interface PlaceRow {
  id: string;
  trip_id: string;
  name: string;
  category: string;
  address: string | null;
  lat: number | string | null;
  lng: number | string | null;
  business_hours: string | null;
  closed_days: string | null;
  estimated_cost: number | string | null;
  cost_currency: string | null;
  duration_min: number | string | null;
  priority: PlacePriority;
  day_index: number | null;
  order_index: number | string;
  memo: string | null;
  link_url: string | null;
  photo_url: string | null;
  tags: string[] | null;
}

function toPlace(row: PlaceRow): Place {
  return {
    id: row.id,
    tripId: toClientTripId(row.trip_id),
    name: row.name,
    category: normalizePlaceCategory(row.category),
    address: row.address ?? undefined,
    lat: asNumber(row.lat),
    lng: asNumber(row.lng),
    businessHours: row.business_hours ?? undefined,
    closedDays: row.closed_days ?? undefined,
    estimatedCost: asNumber(row.estimated_cost),
    costCurrency: row.cost_currency ?? undefined,
    durationMin: asNumber(row.duration_min),
    priority: row.priority,
    dayIndex: row.day_index,
    orderIndex: asRequiredNumber(row.order_index),
    memo: row.memo ?? undefined,
    linkUrl: row.link_url ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    tags: row.tags ?? [],
  };
}

function toRow(input: CreatePlaceInput | UpdatePlaceInput): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if ("tripId" in input && input.tripId) row.trip_id = toDbTripId(input.tripId);
  if (input.name !== undefined) row.name = input.name;
  if (input.category !== undefined) row.category = input.category;
  if (input.address !== undefined) row.address = input.address ?? null;
  if (input.lat !== undefined) row.lat = input.lat ?? null;
  if (input.lng !== undefined) row.lng = input.lng ?? null;
  if (input.businessHours !== undefined) row.business_hours = input.businessHours ?? null;
  if (input.closedDays !== undefined) row.closed_days = input.closedDays ?? null;
  if (input.estimatedCost !== undefined) row.estimated_cost = input.estimatedCost ?? null;
  if (input.costCurrency !== undefined) row.cost_currency = input.costCurrency ?? null;
  if (input.durationMin !== undefined) row.duration_min = input.durationMin ?? null;
  if (input.priority !== undefined) row.priority = input.priority;
  if (input.dayIndex !== undefined) row.day_index = input.dayIndex;
  if (input.orderIndex !== undefined) row.order_index = input.orderIndex;
  if (input.memo !== undefined) row.memo = input.memo ?? null;
  if (input.linkUrl !== undefined) row.link_url = input.linkUrl ?? null;
  if (input.photoUrl !== undefined) row.photo_url = input.photoUrl ?? null;
  if (input.tags !== undefined) row.tags = input.tags;
  return row;
}

export async function fetchPlaces(tripId: string): Promise<Place[]> {
  const supabase = createClient();
  const result = await supabase
    .from("places")
    .select("*")
    .eq("trip_id", toDbTripId(tripId))
    .order("order_index");
  return throwIfError(result).map(toPlace);
}

export async function createPlace(input: CreatePlaceInput): Promise<Place> {
  const supabase = createClient();
  const result = await supabase.from("places").insert(toRow(input)).select("*").single();
  return toPlace(throwIfError(result));
}

export async function updatePlace(
  tripId: string,
  id: string,
  patch: UpdatePlaceInput,
): Promise<Place> {
  const supabase = createClient();
  const result = await supabase
    .from("places")
    .update(toRow(patch))
    .eq("trip_id", toDbTripId(tripId))
    .eq("id", id)
    .select("*")
    .single();
  return toPlace(throwIfError(result));
}

export async function deletePlace(tripId: string, id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("places")
    .delete()
    .eq("trip_id", toDbTripId(tripId))
    .eq("id", id);
  throwIfWriteError(error);
}
