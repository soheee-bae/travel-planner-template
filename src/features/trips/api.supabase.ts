import { createClient } from "@/lib/supabase/client";
import { throwIfError, throwIfWriteError } from "@/lib/supabase/throw";
import type { CreateTripInput, Trip } from "@/mocks/fixtures/trips";

interface TripRow {
  id: string;
  title: string;
  destination_country: string;
  destination_city: string;
  start_date: string;
  end_date: string;
  companions: string;
  cover_emoji: string;
  base_currency: Trip["baseCurrency"];
}

function toTrip(row: TripRow): Trip {
  return {
    id: row.id,
    title: row.title,
    destinationCountry: row.destination_country,
    destinationCity: row.destination_city,
    startDate: row.start_date,
    endDate: row.end_date,
    companions: row.companions,
    coverEmoji: row.cover_emoji,
    baseCurrency: row.base_currency,
  };
}

const TRIP_COLUMNS =
  "id, title, destination_country, destination_city, start_date, end_date, companions, cover_emoji, base_currency";

export async function fetchTrips(): Promise<Trip[]> {
  const supabase = createClient();
  const result = await supabase.from("trips").select(TRIP_COLUMNS).order("start_date", {
    ascending: false,
  });
  return throwIfError(result).map(toTrip);
}

export async function fetchTrip(id: string): Promise<Trip> {
  const supabase = createClient();
  const result = await supabase.from("trips").select(TRIP_COLUMNS).eq("id", id).single();
  return toTrip(throwIfError(result));
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
  return toTrip(throwIfError(result));
}

export async function deleteTrip(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("trips").delete().eq("id", id);
  throwIfWriteError(error);
}
