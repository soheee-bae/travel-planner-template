import { fetchExpenses } from "@/features/expenses/api";
import { initialTripPeople, type TripPerson } from "@/features/trips/people";
import { isMockData } from "@/lib/data-source";
import { randomUUID } from "@/lib/id";
import { createClient } from "@/lib/supabase/client";
import { throwIfError, throwIfWriteError } from "@/lib/supabase/throw";
import { toClientTripId, toDbTripId } from "@/lib/trip-ids";
import { isGiftPayer } from "@/mocks/fixtures/expenses";

interface TripPersonRow {
  id: string;
  trip_id: string;
  display_name: string;
  emoji: string | null;
  sort_order: number;
}

function toPerson(row: TripPersonRow): TripPerson {
  return {
    id: row.id,
    tripId: toClientTripId(row.trip_id),
    displayName: row.display_name,
    emoji: row.emoji ?? "",
    sortOrder: row.sort_order,
  };
}

async function fetchPeopleFromExpenses(tripId: string): Promise<TripPerson[]> {
  const expenses = await fetchExpenses(tripId);
  const names: string[] = [];
  for (const expense of expenses) {
    const name = expense.paidBy?.trim();
    if (!name || isGiftPayer(name) || names.includes(name)) continue;
    names.push(name);
  }
  names.sort((a, b) => a.localeCompare(b, "ko"));
  return names.map((displayName, sortOrder) => ({
    id: `paid_${tripId}_${sortOrder}`,
    tripId,
    displayName,
    emoji: "",
    sortOrder,
  }));
}

async function fetchPeopleFromSupabase(tripId: string): Promise<TripPerson[]> {
  const supabase = createClient();
  const result = await supabase
    .from("trip_people")
    .select("id, trip_id, display_name, emoji, sort_order")
    .eq("trip_id", toDbTripId(tripId))
    .order("sort_order", { ascending: true });
  return throwIfError(result).map(toPerson);
}

export async function fetchTripPeople(tripId: string): Promise<TripPerson[]> {
  if (!isMockData()) {
    try {
      const people = await fetchPeopleFromSupabase(tripId);
      if (people.length > 0) return people;
    } catch {
      // 테이블이 아직 없는 데이터베이스는 지출의 paid_by를 이름으로 쓴다.
    }
    return fetchPeopleFromExpenses(tripId);
  }

  const res = await fetch(`/api/trips/${tripId}/people`);
  if (!res.ok) return initialTripPeople.filter((person) => person.tripId === tripId);
  return (await res.json()) as TripPerson[];
}

export async function createTripPeople(tripId: string, names: string[]): Promise<TripPerson[]> {
  const unique = names.map((name) => name.trim()).filter((name, index, all) => name && all.indexOf(name) === index);
  if (unique.length === 0) return [];

  if (!isMockData()) {
    const supabase = createClient();
    const result = await supabase
      .from("trip_people")
      .insert(
        unique.map((displayName, sortOrder) => ({
          trip_id: toDbTripId(tripId),
          display_name: displayName,
          emoji: "",
          sort_order: sortOrder,
        })),
      )
      .select("id, trip_id, display_name, emoji, sort_order");
    throwIfWriteError(result.error);
    return (result.data ?? []).map(toPerson);
  }

  const res = await fetch(`/api/trips/${tripId}/people`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ names: unique }),
  });
  if (!res.ok) {
    return unique.map((displayName, sortOrder) => ({
      id: randomUUID(),
      tripId,
      displayName,
      emoji: "",
      sortOrder,
    }));
  }
  return (await res.json()) as TripPerson[];
}
