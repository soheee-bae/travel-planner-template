import { isMockData } from "@/lib/data-source";
import * as supabaseApi from "@/features/trips/api.supabase";
import { initialTrips, type CreateTripInput, type Trip, type UpdateTripInput } from "@/mocks/fixtures/trips";

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `요청 실패 (${res.status})`);
  }
  return res.json() as Promise<T>;
}

function fixtureTrip(id: string): Trip | undefined {
  return initialTrips.find((t) => t.id === id);
}

export async function fetchTrips(): Promise<Trip[]> {
  if (!isMockData()) {
    try {
      return await supabaseApi.fetchTrips();
    } catch {
      return initialTrips;
    }
  }
  const res = await fetch("/api/trips");
  if (!res.ok) return initialTrips;
  return parseJsonOrThrow<Trip[]>(res);
}

export async function fetchTrip(id: string): Promise<Trip> {
  const seeded = fixtureTrip(id);
  if (!isMockData()) {
    try {
      return await supabaseApi.fetchTrip(id);
    } catch {
      if (seeded) return seeded;
      throw new Error("여행을 찾을 수 없습니다.");
    }
  }
  try {
    const res = await fetch(`/api/trips/${id}`);
    return await parseJsonOrThrow<Trip>(res);
  } catch (error) {
    if (seeded) return seeded;
    throw error;
  }
}

export async function createTrip(input: CreateTripInput): Promise<Trip> {
  if (!isMockData()) return supabaseApi.createTrip(input);
  const res = await fetch("/api/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow<Trip>(res);
}

export async function updateTrip(id: string, patch: UpdateTripInput): Promise<Trip> {
  if (!isMockData()) return supabaseApi.updateTrip(id, patch);
  const res = await fetch(`/api/trips/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return parseJsonOrThrow<Trip>(res);
}

export async function deleteTrip(id: string): Promise<void> {
  if (!isMockData()) return supabaseApi.deleteTrip(id);
  const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`삭제 실패 (${res.status})`);
  }
}
