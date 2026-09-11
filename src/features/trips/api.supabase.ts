import { createClient } from "@/lib/supabase/client";
import { throwIfError, throwIfWriteError } from "@/lib/supabase/throw";
import { toClientTripId, toDbTripId } from "@/lib/trip-ids";
import type { CreateTripInput, Trip, UpdateTripInput } from "@/mocks/fixtures/trips";

interface TripRow {
  id: string;
  owner_id: string;
  title: string;
  destination_country: string;
  destination_city: string;
  start_date: string;
  end_date: string;
  companions: string;
  cover_emoji: string;
  base_currency: Trip["baseCurrency"];
}

async function currentUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

function toTrip(row: TripRow, userId: string | null): Trip {
  return {
    id: toClientTripId(row.id),
    title: row.title,
    destinationCountry: row.destination_country,
    destinationCity: row.destination_city,
    startDate: row.start_date,
    endDate: row.end_date,
    companions: row.companions,
    coverEmoji: row.cover_emoji,
    baseCurrency: row.base_currency,
    ownerId: row.owner_id,
    role: userId && row.owner_id === userId ? "owner" : "editor",
  };
}

const TRIP_COLUMNS =
  "id, owner_id, title, destination_country, destination_city, start_date, end_date, companions, cover_emoji, base_currency";

export async function fetchTrips(): Promise<Trip[]> {
  const supabase = createClient();
  const userId = await currentUserId();
  const result = await supabase.from("trips").select(TRIP_COLUMNS).order("start_date", {
    ascending: false,
  });
  return throwIfError(result).map((row) => toTrip(row, userId));
}

export async function fetchTrip(id: string): Promise<Trip> {
  const supabase = createClient();
  const userId = await currentUserId();
  const result = await supabase.from("trips").select(TRIP_COLUMNS).eq("id", toDbTripId(id)).single();
  return toTrip(throwIfError(result), userId);
}

export async function createTrip(input: CreateTripInput): Promise<Trip> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("로그인이 필요합니다.");

  const result = await supabase
    .from("trips")
    .insert({
      owner_id: user.id,
      title: input.title,
      destination_country: input.destinationCountry,
      destination_city: input.destinationCity,
      start_date: input.startDate,
      end_date: input.endDate,
      companions: input.companions,
      cover_emoji: input.coverEmoji,
      base_currency: input.baseCurrency,
    })
    .select(TRIP_COLUMNS)
    .single();
  return toTrip(throwIfError(result), user.id);
}

export async function updateTrip(id: string, patch: UpdateTripInput): Promise<Trip> {
  const supabase = createClient();
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.destinationCountry !== undefined) row.destination_country = patch.destinationCountry;
  if (patch.destinationCity !== undefined) row.destination_city = patch.destinationCity;
  if (patch.startDate !== undefined) row.start_date = patch.startDate;
  if (patch.endDate !== undefined) row.end_date = patch.endDate;
  if (patch.companions !== undefined) row.companions = patch.companions;
  if (patch.coverEmoji !== undefined) row.cover_emoji = patch.coverEmoji;
  if (patch.baseCurrency !== undefined) row.base_currency = patch.baseCurrency;
  const result = await supabase
    .from("trips")
    .update(row)
    .eq("id", toDbTripId(id))
    .select(TRIP_COLUMNS)
    .single();
  return toTrip(throwIfError(result), await currentUserId());
}

export async function deleteTrip(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("trips").delete().eq("id", toDbTripId(id));
  throwIfWriteError(error);
}
