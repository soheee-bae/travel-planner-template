import { NextResponse } from "next/server";
import { memory, MockHttpError } from "@/mocks/memory";

/**
 * MSW가 브라우저에서 실패해도(이미 등록됨, SW 차단) 같은 mock을 Next가 내려준다.
 * e2e는 MSW가 가로채면 이 라우트까지 안 온다.
 */
function fail(error: unknown) {
  if (error instanceof MockHttpError) {
    return NextResponse.json({ message: error.message, extra: error.extra }, { status: error.status });
  }
  return NextResponse.json({ message: "요청 실패" }, { status: 500 });
}

async function readBody(request: Request): Promise<unknown> {
  return request.json().catch(() => ({}));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  try {
    const path = (await context.params).path ?? [];
    if (path.length === 0) return NextResponse.json(memory.listTrips());

    const [tripId, resource, id] = path;
    if (path.length === 1) return NextResponse.json(memory.getTrip(tripId));

    if (resource === "places" && !id) return NextResponse.json(memory.listPlaces(tripId));
    if (resource === "expenses" && !id) return NextResponse.json(memory.listExpenses(tripId));
    if (resource === "accommodations" && !id) {
      return NextResponse.json(memory.listAccommodations(tripId));
    }
    if (resource === "transports" && !id) return NextResponse.json(memory.listTransports(tripId));
    if (resource === "checklist-categories" && !id) {
      return NextResponse.json(memory.listChecklistCategories(tripId));
    }
    if (resource === "checklist-items" && !id) {
      return NextResponse.json(memory.listChecklistItems(tripId));
    }
    if (resource === "wishlist" && !id) return NextResponse.json(memory.listWishlist(tripId));
    if (resource === "time-capsules" && !id) {
      return NextResponse.json(memory.listTimeCapsules(tripId));
    }

    return NextResponse.json({ message: "없는 경로입니다." }, { status: 404 });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  try {
    const path = (await context.params).path ?? [];
    const body = await readBody(request);
    if (path.length === 0) {
      return NextResponse.json(memory.createTrip(body), { status: 201 });
    }

    const [tripId, resource] = path;
    if (resource === "places") {
      return NextResponse.json(memory.createPlace(tripId, body), { status: 201 });
    }
    if (resource === "expenses") {
      return NextResponse.json(memory.createExpense(tripId, body), { status: 201 });
    }
    if (resource === "accommodations") {
      return NextResponse.json(memory.createAccommodation(tripId, body), { status: 201 });
    }
    if (resource === "transports") {
      return NextResponse.json(memory.createTransport(tripId, body), { status: 201 });
    }
    if (resource === "checklist-categories") {
      return NextResponse.json(memory.createChecklistCategory(tripId, body), { status: 201 });
    }
    if (resource === "checklist-items") {
      return NextResponse.json(memory.createChecklistItem(tripId, body), { status: 201 });
    }
    if (resource === "wishlist") {
      return NextResponse.json(memory.createWishlist(tripId, body), { status: 201 });
    }

    return NextResponse.json({ message: "없는 경로입니다." }, { status: 404 });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  try {
    const path = (await context.params).path ?? [];
    const body = await readBody(request);
    const [tripId, resource, id] = path;

    if (path.length === 1) return NextResponse.json(memory.updateTrip(tripId, body));
    if (!id) return NextResponse.json({ message: "없는 경로입니다." }, { status: 404 });

    if (resource === "places") return NextResponse.json(memory.updatePlace(tripId, id, body));
    if (resource === "expenses") return NextResponse.json(memory.updateExpense(tripId, id, body));
    if (resource === "accommodations") {
      return NextResponse.json(memory.updateAccommodation(tripId, id, body));
    }
    if (resource === "transports") {
      return NextResponse.json(memory.updateTransport(tripId, id, body));
    }
    if (resource === "checklist-categories") {
      return NextResponse.json(memory.updateChecklistCategory(tripId, id, body));
    }
    if (resource === "checklist-items") {
      return NextResponse.json(memory.updateChecklistItem(tripId, id, body));
    }
    if (resource === "wishlist") return NextResponse.json(memory.updateWishlist(tripId, id, body));

    return NextResponse.json({ message: "없는 경로입니다." }, { status: 404 });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  try {
    const path = (await context.params).path ?? [];
    const [tripId, resource, id] = path;

    if (path.length === 1) {
      memory.deleteTrip(tripId);
      return new NextResponse(null, { status: 204 });
    }
    if (!id) return NextResponse.json({ message: "없는 경로입니다." }, { status: 404 });

    if (resource === "places") memory.deletePlace(tripId, id);
    else if (resource === "expenses") memory.deleteExpense(tripId, id);
    else if (resource === "accommodations") memory.deleteAccommodation(id);
    else if (resource === "transports") memory.deleteTransport(id);
    else if (resource === "checklist-categories") memory.deleteChecklistCategory(id);
    else if (resource === "checklist-items") memory.deleteChecklistItem(tripId, id);
    else if (resource === "wishlist") memory.deleteWishlist(tripId, id);
    else return NextResponse.json({ message: "없는 경로입니다." }, { status: 404 });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return fail(error);
  }
}
