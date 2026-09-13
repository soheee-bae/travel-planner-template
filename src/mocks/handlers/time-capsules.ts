import { http, HttpResponse } from "msw";
import { initialTimeCapsules } from "@/mocks/fixtures/time-capsules";

let capsules = [...initialTimeCapsules];

export const timeCapsuleHandlers = [
  http.get("/api/trips/:tripId/time-capsules", async ({ params }) => {
    return HttpResponse.json(
      capsules.filter((item) => item.tripId === params.tripId).sort((a, b) => a.sortOrder - b.sortOrder),
    );
  }),
];
