import { redirect } from "next/navigation";
import { JEJU_TRIP_ID } from "@/lib/jeju-trip";

/** V1: 여행 카드 목록 없음. 제주 생일 여행으로 바로 들어간다. */
export default function TripsPage() {
  redirect(`/trips/${JEJU_TRIP_ID}`);
}
