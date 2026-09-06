import { http, HttpResponse } from "msw";
import { randomUUID } from "@/lib/id";
import {
  createAccommodationInputSchema,
  createTransportInputSchema,
  updateAccommodationInputSchema,
  updateTransportInputSchema,
  initialAccommodations,
  initialTransports,
  type Accommodation,
  type Transport,
} from "@/mocks/fixtures/overview";

let accommodations: Accommodation[] = [...initialAccommodations];
let transports: Transport[] = [...initialTransports];

export const overviewHandlers = [
  http.get("/api/trips/:tripId/accommodations", async ({ params }) => {
    return HttpResponse.json(accommodations.filter((a) => a.tripId === params.tripId));
  }),

  http.post("/api/trips/:tripId/accommodations", async ({ params, request }) => {
    const body = await request.json();
    const parsed = createAccommodationInputSchema.safeParse({
      ...(body as object),
      tripId: params.tripId,
    });
    if (!parsed.success) {
      return HttpResponse.json(
        { message: "잘못된 입력입니다.", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const created: Accommodation = { id: randomUUID(), ...parsed.data };
    accommodations = [created, ...accommodations];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch("/api/trips/:tripId/accommodations/:id", async ({ params, request }) => {
    const body = await request.json();
    const parsed = updateAccommodationInputSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json({ message: "잘못된 입력입니다." }, { status: 400 });
    }
    const index = accommodations.findIndex(
      (a) => a.id === params.id && a.tripId === params.tripId,
    );
    if (index === -1) {
      return HttpResponse.json({ message: "숙소를 찾을 수 없습니다." }, { status: 404 });
    }
    accommodations[index] = { ...accommodations[index], ...parsed.data };
    return HttpResponse.json(accommodations[index]);
  }),

  http.delete("/api/trips/:tripId/accommodations/:id", async ({ params }) => {
    accommodations = accommodations.filter((a) => a.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/trips/:tripId/transports", async ({ params }) => {
    return HttpResponse.json(transports.filter((t) => t.tripId === params.tripId));
  }),

  http.post("/api/trips/:tripId/transports", async ({ params, request }) => {
    const body = await request.json();
    const parsed = createTransportInputSchema.safeParse({
      ...(body as object),
      tripId: params.tripId,
    });
    if (!parsed.success) {
      return HttpResponse.json(
        { message: "잘못된 입력입니다.", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const created: Transport = { id: randomUUID(), ...parsed.data };
    transports = [created, ...transports];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch("/api/trips/:tripId/transports/:id", async ({ params, request }) => {
    const body = await request.json();
    const parsed = updateTransportInputSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json({ message: "잘못된 입력입니다." }, { status: 400 });
    }
    const index = transports.findIndex((t) => t.id === params.id && t.tripId === params.tripId);
    if (index === -1) {
      return HttpResponse.json({ message: "교통편을 찾을 수 없습니다." }, { status: 404 });
    }
    transports[index] = { ...transports[index], ...parsed.data };
    return HttpResponse.json(transports[index]);
  }),

  http.delete("/api/trips/:tripId/transports/:id", async ({ params }) => {
    transports = transports.filter((t) => t.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
];
