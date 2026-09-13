import { isMockData } from "@/lib/data-source";
import * as supabaseApi from "@/features/overview/api.supabase";
import type {
  Accommodation,
  CreateAccommodationInput,
  CreateTransportInput,
  Transport,
  UpdateAccommodationInput,
  UpdateTransportInput,
} from "@/mocks/fixtures/overview";
import type { TimeCapsule } from "@/mocks/fixtures/time-capsules";

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `요청 실패 (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchAccommodations(tripId: string): Promise<Accommodation[]> {
  if (!isMockData()) return supabaseApi.fetchAccommodations(tripId);
  const res = await fetch(`/api/trips/${tripId}/accommodations`);
  return parseJsonOrThrow<Accommodation[]>(res);
}

export async function createAccommodation(input: CreateAccommodationInput): Promise<Accommodation> {
  if (!isMockData()) return supabaseApi.createAccommodation(input);
  const res = await fetch(`/api/trips/${input.tripId}/accommodations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow<Accommodation>(res);
}

export async function updateAccommodation(
  tripId: string,
  id: string,
  patch: UpdateAccommodationInput,
): Promise<Accommodation> {
  if (!isMockData()) return supabaseApi.updateAccommodation(tripId, id, patch);
  const res = await fetch(`/api/trips/${tripId}/accommodations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return parseJsonOrThrow<Accommodation>(res);
}

export async function deleteAccommodation(tripId: string, id: string): Promise<void> {
  if (!isMockData()) return supabaseApi.deleteAccommodation(tripId, id);
  const res = await fetch(`/api/trips/${tripId}/accommodations/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
}

export async function fetchTransports(tripId: string): Promise<Transport[]> {
  if (!isMockData()) return supabaseApi.fetchTransports(tripId);
  const res = await fetch(`/api/trips/${tripId}/transports`);
  return parseJsonOrThrow<Transport[]>(res);
}

export async function createTransport(input: CreateTransportInput): Promise<Transport> {
  if (!isMockData()) return supabaseApi.createTransport(input);
  const res = await fetch(`/api/trips/${input.tripId}/transports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow<Transport>(res);
}

export async function updateTransport(
  tripId: string,
  id: string,
  patch: UpdateTransportInput,
): Promise<Transport> {
  if (!isMockData()) return supabaseApi.updateTransport(tripId, id, patch);
  const res = await fetch(`/api/trips/${tripId}/transports/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return parseJsonOrThrow<Transport>(res);
}

export async function deleteTransport(tripId: string, id: string): Promise<void> {
  if (!isMockData()) return supabaseApi.deleteTransport(tripId, id);
  const res = await fetch(`/api/trips/${tripId}/transports/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
}

export async function fetchTimeCapsules(tripId: string): Promise<TimeCapsule[]> {
  if (!isMockData()) return supabaseApi.fetchTimeCapsules(tripId);
  const res = await fetch(`/api/trips/${tripId}/time-capsules`);
  return parseJsonOrThrow<TimeCapsule[]>(res);
}
