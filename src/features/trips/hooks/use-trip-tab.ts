"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const TRIP_TABS = ["overview", "planner", "places", "budget", "prep", "memo"] as const;
export const NAV_SWIPE_TABS = ["overview", "planner", "places", "budget", "prep"] as const;
export type TripTab = (typeof TRIP_TABS)[number];
export type TripPanel = (typeof NAV_SWIPE_TABS)[number];

const DEFAULT_TAB: TripTab = "overview";

/**
 * 탭은 로컬 상태가 소스다. URL의 ?tab=은 세션 중에만 맞춰 두고,
 * 여행에 들어올 때는 항상 홈으로 시작한다.
 */
export function useTripTab() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tab, setTabState] = useState<TripTab>(DEFAULT_TAB);

  useEffect(() => {
    if (!searchParams.get("tab")) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tab");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // 들어올 때 한 번만 홈으로 맞춘다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTab = useCallback(
    (next: TripTab) => {
      setTabState(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next === DEFAULT_TAB) {
        params.delete("tab");
      } else {
        params.set("tab", next);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { tab, setTab };
}
