import { createClient } from "@/lib/supabase/client";
import { asNumber, asTime, throwIfError, throwIfWriteError } from "@/lib/supabase/throw";
import type {
  Accommodation,
  CreateAccommodationInput,
  CreateTransportInput,
  Transport,
} from "@/mocks/fixtures/overview";

interface AccommodationRow {
  id: string;
  trip_id: string;
  name: string;
  checkin_date: string;
  checkout_date: string;
  checkin_time: string | null;
  checkout_time: string | null;
  address: string | null;
  booking_ref: string | null;
  cost: number | string | null;
  memo: string | null;
}

interface TransportRow {
  id: string;
  trip_id: string;
  type: Transport["type"];
  departure_from: string;
  arrival_to: string;
  departure_at: string;
  arrival_at: string;
  booking_ref: string | null;
  cost: number | string | null;
  memo: string | null;
}

function toAccommodation(row: AccommodationRow): Accommodation {
  return {
    id: row.id,
    tripId: row.trip_id,
    name: row.name,
    checkinDate: row.checkin_date,
    checkoutDate: row.checkout_date,
    checkinTime: asTime(row.checkin_time),
    checkoutTime: asTime(row.checkout_time),
    address: row.address ?? undefined,
    bookingRef: row.booking_ref ?? undefined,
    cost: asNumber(row.cost),
    memo: row.memo ?? undefined,
  };
}

function toTransport(row: TransportRow): Transport {
  return {
    id: row.id,
    tripId: row.trip_id,
    type: row.type,
    departureFrom: row.departure_from,
    arrivalTo: row.arrival_to,
    departureAt: row.departure_at.slice(0, 16),
    arrivalAt: row.arrival_at.slice(0, 16),
    bookingRef: row.booking_ref ?? undefined,
    cost: asNumber(row.cost),
    memo: row.memo ?? undefined,
  };
}

export async function fetchAccommodations(tripId: string): Promise<Accommodation[]> {
  const supabase = createClient();
  const result = await supabase.from("accommodations").select("*").eq("trip_id", tripId);
  return throwIfError(result).map(toAccommodation);
}

export async function createAccommodation(input: CreateAccommodationInput): Promise<Accommodation> {
  const supabase = createClient();
  const result = await supabase
    .from("accommodations")
    .insert({
      trip_id: input.tripId,
      name: input.name,
      checkin_date: input.checkinDate,
      checkout_date: input.checkoutDate,
      checkin_time: input.checkinTime ?? null,
      checkout_time: input.checkoutTime ?? null,
      address: input.address ?? null,
      booking_ref: input.bookingRef ?? null,
      cost: input.cost ?? null,
      memo: input.memo ?? null,
    })
    .select("*")
    .single();
  return toAccommodation(throwIfError(result));
}

export async function updateAccommodation(
  tripId: string,
  id: string,
  patch: import("@/mocks/fixtures/overview").UpdateAccommodationInput,
): Promise<Accommodation> {
  const supabase = createClient();
  const result = await supabase
    .from("accommodations")
    .update({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.checkinDate !== undefined ? { checkin_date: patch.checkinDate } : {}),
      ...(patch.checkoutDate !== undefined ? { checkout_date: patch.checkoutDate } : {}),
      ...(patch.checkinTime !== undefined ? { checkin_time: patch.checkinTime ?? null } : {}),
      ...(patch.checkoutTime !== undefined ? { checkout_time: patch.checkoutTime ?? null } : {}),
      ...(patch.address !== undefined ? { address: patch.address ?? null } : {}),
      ...(patch.bookingRef !== undefined ? { booking_ref: patch.bookingRef ?? null } : {}),
      ...(patch.cost !== undefined ? { cost: patch.cost ?? null } : {}),
      ...(patch.memo !== undefined ? { memo: patch.memo ?? null } : {}),
    })
    .eq("trip_id", tripId)
    .eq("id", id)
    .select("*")
    .single();
  return toAccommodation(throwIfError(result));
}

export async function deleteAccommodation(tripId: string, id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("accommodations")
    .delete()
    .eq("trip_id", tripId)
    .eq("id", id);
  throwIfWriteError(error);
}

export async function fetchTransports(tripId: string): Promise<Transport[]> {
  const supabase = createClient();
  const result = await supabase.from("transports").select("*").eq("trip_id", tripId);
  return throwIfError(result).map(toTransport);
}

export async function createTransport(input: CreateTransportInput): Promise<Transport> {
  const supabase = createClient();
  const result = await supabase
    .from("transports")
    .insert({
      trip_id: input.tripId,
      type: input.type,
      departure_from: input.departureFrom,
      arrival_to: input.arrivalTo,
      departure_at: input.departureAt,
      arrival_at: input.arrivalAt,
      booking_ref: input.bookingRef ?? null,
      cost: input.cost ?? null,
      memo: input.memo ?? null,
    })
    .select("*")
    .single();
  return toTransport(throwIfError(result));
}

export async function updateTransport(
  tripId: string,
  id: string,
  patch: import("@/mocks/fixtures/overview").UpdateTransportInput,
): Promise<Transport> {
  const supabase = createClient();
  const result = await supabase
    .from("transports")
    .update({
      ...(patch.type !== undefined ? { type: patch.type } : {}),
      ...(patch.departureFrom !== undefined ? { departure_from: patch.departureFrom } : {}),
      ...(patch.arrivalTo !== undefined ? { arrival_to: patch.arrivalTo } : {}),
      ...(patch.departureAt !== undefined ? { departure_at: patch.departureAt } : {}),
      ...(patch.arrivalAt !== undefined ? { arrival_at: patch.arrivalAt } : {}),
      ...(patch.bookingRef !== undefined ? { booking_ref: patch.bookingRef ?? null } : {}),
      ...(patch.cost !== undefined ? { cost: patch.cost ?? null } : {}),
      ...(patch.memo !== undefined ? { memo: patch.memo ?? null } : {}),
    })
    .eq("trip_id", tripId)
    .eq("id", id)
    .select("*")
    .single();
  return toTransport(throwIfError(result));
}

export async function deleteTransport(tripId: string, id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("transports").delete().eq("trip_id", tripId).eq("id", id);
  throwIfWriteError(error);
}
