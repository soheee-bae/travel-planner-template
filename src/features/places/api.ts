import { isMockData } from "@/lib/data-source";
import * as supabaseApi from "@/features/places/api.supabase";
import type { CreatePlaceInput, Place, UpdatePlaceInput } from "@/mocks/fixtures/places";

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `요청 실패 (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchPlaces(tripId: string): Promise<Place[]> {
  if (!isMockData()) return supabaseApi.fetchPlaces(tripId);
  const res = await fetch(`/api/trips/${tripId}/places`);
  return parseJsonOrThrow<Place[]>(res);
}

export async function createPlace(input: CreatePlaceInput): Promise<Place> {
  if (!isMockData()) return supabaseApi.createPlace(input);
  const res = await fetch(`/api/trips/${input.tripId}/places`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow<Place>(res);
}

export async function updatePlace(
  tripId: string,
  id: string,
  patch: UpdatePlaceInput,
): Promise<Place> {
  if (!isMockData()) return supabaseApi.updatePlace(tripId, id, patch);
  const res = await fetch(`/api/trips/${tripId}/places/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return parseJsonOrThrow<Place>(res);
}

export async function deletePlace(tripId: string, id: string): Promise<void> {
  if (!isMockData()) return supabaseApi.deletePlace(tripId, id);
  const res = await fetch(`/api/trips/${tripId}/places/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
}
