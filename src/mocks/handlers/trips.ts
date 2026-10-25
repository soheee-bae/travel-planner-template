import { http, HttpResponse } from "msw";
import { randomUUID } from "@/lib/id";
import { initialTripPeople, type TripPerson } from "@/features/trips/people";
import {
  createTripInputSchema,
  initialTrips,
  updateTripInputSchema,
  type Trip,
} from "@/mocks/fixtures/trips";

// 모듈 스코프 배열 — MSW 핸들러 안에서 POST/DELETE가 이 상태를 직접 변경한다.
// 실제 DB가 붙기 전까지(Phase 10) React Query의 mutation 왕복을 검증하는 용도.
let trips: Trip[] = [...initialTrips];
let people: TripPerson[] = [...initialTripPeople];

export const tripHandlers = [
  http.get("/api/trips", async () => {
    return HttpResponse.json(trips);
  }),

  http.get("/api/trips/:id", async ({ params }) => {
    const trip = trips.find((t) => t.id === params.id);
    if (!trip) {
      return HttpResponse.json({ message: "여행을 찾을 수 없습니다." }, { status: 404 });
    }
    return HttpResponse.json(trip);
  }),

  http.post("/api/trips", async ({ request }) => {
    const body = await request.json();
    const parsed = createTripInputSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json(
        { message: "잘못된 입력입니다.", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const trip: Trip = { id: randomUUID(), ...parsed.data };
    trips = [trip, ...trips];
    return HttpResponse.json(trip, { status: 201 });
  }),

  http.patch("/api/trips/:id", async ({ params, request }) => {
    const body = await request.json();
    const parsed = updateTripInputSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json({ message: "잘못된 입력입니다." }, { status: 400 });
    }
    const index = trips.findIndex((t) => t.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ message: "여행을 찾을 수 없습니다." }, { status: 404 });
    }
    trips[index] = { ...trips[index], ...parsed.data };
    return HttpResponse.json(trips[index]);
  }),

  http.delete("/api/trips/:id", async ({ params }) => {
    const { id } = params;
    trips = trips.filter((t) => t.id !== id);
    people = people.filter((person) => person.tripId !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/trips/:id/people", async ({ params }) => {
    return HttpResponse.json(people.filter((person) => person.tripId === params.id));
  }),

  http.post("/api/trips/:id/people", async ({ params, request }) => {
    const body = (await request.json()) as { names?: unknown };
    const names = Array.isArray(body.names) ? body.names.filter((name): name is string => typeof name === "string") : [];
    const tripId = String(params.id);
    const created: TripPerson[] = names
      .map((name) => name.trim())
      .filter((name, index, all) => name && all.indexOf(name) === index)
      .filter((name) => !people.some((person) => person.tripId === tripId && person.displayName === name))
      .map((displayName, index) => ({
        id: randomUUID(),
        tripId,
        displayName,
        emoji: "",
        sortOrder: people.filter((person) => person.tripId === tripId).length + index,
      }));
    people = [...people, ...created];
    return HttpResponse.json(people.filter((person) => person.tripId === tripId), { status: 201 });
  }),
];
