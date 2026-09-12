import { randomUUID } from "@/lib/id";
import {
  createAccommodationInputSchema,
  createTransportInputSchema,
  initialAccommodations,
  initialTransports,
  updateAccommodationInputSchema,
  updateTransportInputSchema,
  type Accommodation,
  type Transport,
} from "@/mocks/fixtures/overview";
import {
  createChecklistCategoryInputSchema,
  createChecklistItemInputSchema,
  initialChecklistCategories,
  initialChecklistItems,
  updateChecklistCategoryInputSchema,
  updateChecklistItemInputSchema,
  type ChecklistCategory,
  type ChecklistItem,
} from "@/mocks/fixtures/checklists";
import {
  createExpenseInputSchema,
  initialExpenses,
  updateExpenseInputSchema,
  type Expense,
} from "@/mocks/fixtures/expenses";
import {
  applyPlacePatch,
  createPlaceInputSchema,
  initialPlaces,
  updatePlaceInputSchema,
  type Place,
} from "@/mocks/fixtures/places";
import {
  createTripInputSchema,
  initialTrips,
  updateTripInputSchema,
  type Trip,
} from "@/mocks/fixtures/trips";
import {
  createWishlistItemInputSchema,
  initialWishlistItems,
  updateWishlistItemInputSchema,
  type WishlistItem,
} from "@/mocks/fixtures/wishlist";

export class MockHttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public extra?: unknown,
  ) {
    super(message);
  }
}

let trips: Trip[] = [...initialTrips];
let places: Place[] = [...initialPlaces];
let expenses: Expense[] = [...initialExpenses];
let accommodations: Accommodation[] = [...initialAccommodations];
let transports: Transport[] = [...initialTransports];
let checklistCategories: ChecklistCategory[] = [...initialChecklistCategories];
let checklistItems: ChecklistItem[] = [...initialChecklistItems];
let wishlistItems: WishlistItem[] = [...initialWishlistItems];

function parseOrThrow<T>(
  parsed: { success: true; data: T } | { success: false; error: { issues: unknown } },
): T {
  if (!parsed.success) {
    throw new MockHttpError(400, "잘못된 입력입니다.", { issues: parsed.error.issues });
  }
  return parsed.data;
}

export const memory = {
  listTrips: () => trips,
  getTrip: (id: string) => {
    const trip = trips.find((t) => t.id === id);
    if (!trip) throw new MockHttpError(404, "여행을 찾을 수 없습니다.");
    return trip;
  },
  createTrip: (body: unknown) => {
    const data = parseOrThrow(createTripInputSchema.safeParse(body));
    const trip: Trip = { id: randomUUID(), ...data };
    trips = [trip, ...trips];
    return trip;
  },
  updateTrip: (id: string, body: unknown) => {
    const data = parseOrThrow(updateTripInputSchema.safeParse(body));
    const index = trips.findIndex((t) => t.id === id);
    if (index === -1) throw new MockHttpError(404, "여행을 찾을 수 없습니다.");
    trips[index] = { ...trips[index], ...data };
    return trips[index];
  },
  deleteTrip: (id: string) => {
    trips = trips.filter((t) => t.id !== id);
  },

  listPlaces: (tripId: string) => places.filter((p) => p.tripId === tripId),
  createPlace: (tripId: string, body: unknown) => {
    const data = parseOrThrow(createPlaceInputSchema.safeParse({ ...(body as object), tripId }));
    const created: Place = { id: randomUUID(), ...data };
    places = [created, ...places];
    return created;
  },
  updatePlace: (tripId: string, id: string, body: unknown) => {
    const data = parseOrThrow(updatePlaceInputSchema.safeParse(body));
    const index = places.findIndex((p) => p.id === id && p.tripId === tripId);
    if (index === -1) throw new MockHttpError(404, "장소를 찾을 수 없습니다.");
    places[index] = applyPlacePatch(places[index], data);
    return places[index];
  },
  deletePlace: (tripId: string, id: string) => {
    places = places.filter((p) => !(p.id === id && p.tripId === tripId));
  },

  listExpenses: (tripId: string) => expenses.filter((e) => e.tripId === tripId),
  createExpense: (tripId: string, body: unknown) => {
    const data = parseOrThrow(createExpenseInputSchema.safeParse({ ...(body as object), tripId }));
    const created: Expense = { id: randomUUID(), ...data };
    expenses = [created, ...expenses];
    return created;
  },
  updateExpense: (tripId: string, id: string, body: unknown) => {
    const data = parseOrThrow(updateExpenseInputSchema.safeParse(body));
    const index = expenses.findIndex((e) => e.id === id && e.tripId === tripId);
    if (index === -1) throw new MockHttpError(404, "비용을 찾을 수 없습니다.");
    expenses[index] = { ...expenses[index], ...data };
    return expenses[index];
  },
  deleteExpense: (tripId: string, id: string) => {
    expenses = expenses.filter((e) => !(e.id === id && e.tripId === tripId));
  },

  listAccommodations: (tripId: string) => accommodations.filter((a) => a.tripId === tripId),
  createAccommodation: (tripId: string, body: unknown) => {
    const data = parseOrThrow(
      createAccommodationInputSchema.safeParse({ ...(body as object), tripId }),
    );
    const created: Accommodation = { id: randomUUID(), ...data };
    accommodations = [created, ...accommodations];
    return created;
  },
  updateAccommodation: (tripId: string, id: string, body: unknown) => {
    const data = parseOrThrow(updateAccommodationInputSchema.safeParse(body));
    const index = accommodations.findIndex((a) => a.id === id && a.tripId === tripId);
    if (index === -1) throw new MockHttpError(404, "숙소를 찾을 수 없습니다.");
    accommodations[index] = { ...accommodations[index], ...data };
    return accommodations[index];
  },
  deleteAccommodation: (id: string) => {
    accommodations = accommodations.filter((a) => a.id !== id);
  },

  listTransports: (tripId: string) => transports.filter((t) => t.tripId === tripId),
  createTransport: (tripId: string, body: unknown) => {
    const data = parseOrThrow(createTransportInputSchema.safeParse({ ...(body as object), tripId }));
    const created: Transport = { id: randomUUID(), ...data };
    transports = [created, ...transports];
    return created;
  },
  updateTransport: (tripId: string, id: string, body: unknown) => {
    const data = parseOrThrow(updateTransportInputSchema.safeParse(body));
    const index = transports.findIndex((t) => t.id === id && t.tripId === tripId);
    if (index === -1) throw new MockHttpError(404, "교통편을 찾을 수 없습니다.");
    transports[index] = { ...transports[index], ...data };
    return transports[index];
  },
  deleteTransport: (id: string) => {
    transports = transports.filter((t) => t.id !== id);
  },

  listChecklistCategories: (tripId: string) =>
    checklistCategories.filter((c) => c.tripId === tripId),
  createChecklistCategory: (tripId: string, body: unknown) => {
    const data = parseOrThrow(
      createChecklistCategoryInputSchema.safeParse({ ...(body as object), tripId }),
    );
    const created: ChecklistCategory = { id: randomUUID(), ...data };
    checklistCategories = [...checklistCategories, created];
    return created;
  },
  updateChecklistCategory: (tripId: string, id: string, body: unknown) => {
    const data = parseOrThrow(updateChecklistCategoryInputSchema.safeParse(body));
    const index = checklistCategories.findIndex((c) => c.id === id && c.tripId === tripId);
    if (index === -1) throw new MockHttpError(404, "카테고리를 찾을 수 없습니다.");
    checklistCategories[index] = { ...checklistCategories[index], ...data };
    return checklistCategories[index];
  },
  deleteChecklistCategory: (id: string) => {
    checklistCategories = checklistCategories.filter((c) => c.id !== id);
    checklistItems = checklistItems.filter((i) => i.categoryId !== id);
  },

  listChecklistItems: (tripId: string) => checklistItems.filter((i) => i.tripId === tripId),
  createChecklistItem: (tripId: string, body: unknown) => {
    const data = parseOrThrow(
      createChecklistItemInputSchema.safeParse({ ...(body as object), tripId }),
    );
    const created: ChecklistItem = { id: randomUUID(), ...data };
    checklistItems = [...checklistItems, created];
    return created;
  },
  updateChecklistItem: (tripId: string, id: string, body: unknown) => {
    const data = parseOrThrow(updateChecklistItemInputSchema.safeParse(body));
    const index = checklistItems.findIndex((i) => i.id === id && i.tripId === tripId);
    if (index === -1) throw new MockHttpError(404, "항목을 찾을 수 없습니다.");
    checklistItems[index] = { ...checklistItems[index], ...data };
    return checklistItems[index];
  },
  deleteChecklistItem: (tripId: string, id: string) => {
    checklistItems = checklistItems.filter((i) => !(i.id === id && i.tripId === tripId));
  },

  listWishlist: (tripId: string) => wishlistItems.filter((i) => i.tripId === tripId),
  createWishlist: (tripId: string, body: unknown) => {
    const data = parseOrThrow(
      createWishlistItemInputSchema.safeParse({ ...(body as object), tripId }),
    );
    const created: WishlistItem = { id: randomUUID(), ...data };
    wishlistItems = [...wishlistItems, created];
    return created;
  },
  updateWishlist: (tripId: string, id: string, body: unknown) => {
    const data = parseOrThrow(updateWishlistItemInputSchema.safeParse(body));
    const index = wishlistItems.findIndex((i) => i.id === id && i.tripId === tripId);
    if (index === -1) throw new MockHttpError(404, "항목을 찾을 수 없습니다.");
    wishlistItems[index] = { ...wishlistItems[index], ...data };
    return wishlistItems[index];
  },
  deleteWishlist: (tripId: string, id: string) => {
    wishlistItems = wishlistItems.filter((i) => !(i.id === id && i.tripId === tripId));
  },
};
