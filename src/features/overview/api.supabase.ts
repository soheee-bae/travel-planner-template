import { airportCodeFromName } from "@/lib/airport";
import { createClient } from "@/lib/supabase/client";
import { asNumber, asTime, throwIfError, throwIfWriteError } from "@/lib/supabase/throw";
import { toClientTripId, toDbTripId } from "@/lib/trip-ids";
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
  icon: string | null;
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
  seat1: string | null;
  seat2: string | null;
  departure_code: string | null;
  arrival_code: string | null;
}

function toAccommodation(row: AccommodationRow): Accommodation {
  return {
    id: row.id,
    tripId: toClientTripId(row.trip_id),
    name: row.name,
    checkinDate: row.checkin_date,
    checkoutDate: row.checkout_date,
    checkinTime: asTime(row.checkin_time),
    checkoutTime: asTime(row.checkout_time),
    address: row.address ?? undefined,
    bookingRef: row.booking_ref ?? undefined,
    cost: asNumber(row.cost),
    memo: row.memo ?? undefined,
    icon: row.icon ?? undefined,
  };
}

function toTransport(row: TransportRow): Transport {
  return {
    id: row.id,
    tripId: toClientTripId(row.trip_id),
    type: row.type,
    departureFrom: row.departure_from,
    arrivalTo: row.arrival_to,
    departureAt: row.departure_at.slice(0, 16),
    arrivalAt: row.arrival_at.slice(0, 16),
    bookingRef: row.booking_ref ?? undefined,
    cost: asNumber(row.cost),
    memo: row.memo ?? undefined,
    seat1: row.seat1 ?? undefined,
    seat2: row.seat2 ?? undefined,
    departureCode: row.departure_code ?? airportCodeFromName(row.departure_from),
    arrivalCode: row.arrival_code ?? airportCodeFromName(row.arrival_to),
  };
}

export async function fetchAccommodations(tripId: string): Promise<Accommodation[]> {
  const supabase = createClient();
  const result = await supabase.from("accommodations").select("*").eq("trip_id", toDbTripId(tripId));
  return throwIfError(result).map(toAccommodation);
}

export async function createAccommodation(input: CreateAccommodationInput): Promise<Accommodation> {
  const supabase = createClient();
  const result = await supabase
    .from("accommodations")
    .insert({
      trip_id: toDbTripId(input.tripId),
      name: input.name,
      checkin_date: input.checkinDate,
      checkout_date: input.checkoutDate,
      checkin_time: input.checkinTime ?? null,
      checkout_time: input.checkoutTime ?? null,
      address: input.address ?? null,
      booking_ref: input.bookingRef ?? null,
      cost: input.cost ?? null,
      memo: input.memo ?? null,
      icon: input.icon ?? "🏨",
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
      ...(patch.icon !== undefined ? { icon: patch.icon ?? null } : {}),
    })
    .eq("trip_id", toDbTripId(tripId))
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
    .eq("trip_id", toDbTripId(tripId))
    .eq("id", id);
  throwIfWriteError(error);
}

export async function fetchTransports(tripId: string): Promise<Transport[]> {
  const supabase = createClient();
  const result = await supabase.from("transports").select("*").eq("trip_id", toDbTripId(tripId));
  return throwIfError(result).map(toTransport);
}

export async function createTransport(input: CreateTransportInput): Promise<Transport> {
  const supabase = createClient();
  const result = await supabase
    .from("transports")
    .insert({
      trip_id: toDbTripId(input.tripId),
      type: input.type,
      departure_from: input.departureFrom,
      arrival_to: input.arrivalTo,
      departure_at: input.departureAt,
      arrival_at: input.arrivalAt,
      booking_ref: input.bookingRef ?? null,
      cost: input.cost ?? null,
      memo: input.memo ?? null,
      seat1: input.seat1 ?? null,
      seat2: input.seat2 ?? null,
      departure_code: input.departureCode ?? airportCodeFromName(input.departureFrom),
      arrival_code: input.arrivalCode ?? airportCodeFromName(input.arrivalTo),
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
      ...(patch.seat1 !== undefined ? { seat1: patch.seat1 ?? null } : {}),
      ...(patch.seat2 !== undefined ? { seat2: patch.seat2 ?? null } : {}),
      ...(patch.departureCode !== undefined
        ? { departure_code: patch.departureCode ?? null }
        : patch.departureFrom !== undefined
          ? { departure_code: airportCodeFromName(patch.departureFrom) }
          : {}),
      ...(patch.arrivalCode !== undefined
        ? { arrival_code: patch.arrivalCode ?? null }
        : patch.arrivalTo !== undefined
          ? { arrival_code: airportCodeFromName(patch.arrivalTo) }
          : {}),
    })
    .eq("trip_id", toDbTripId(tripId))
    .eq("id", id)
    .select("*")
    .single();
  return toTransport(throwIfError(result));
}

export async function deleteTransport(tripId: string, id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("transports").delete().eq("trip_id", toDbTripId(tripId)).eq("id", id);
  throwIfWriteError(error);
}
