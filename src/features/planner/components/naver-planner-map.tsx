"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { loadNaverMapsScript, type NaverMapsApi } from "@/lib/naver-maps-script";
import { visitNumbers } from "@/lib/visit-order";
import type { Place } from "@/mocks/fixtures/places";

function markerHtml(label: string, selected: boolean, faded: boolean): string {
  const bg = selected ? "#2563eb" : faded ? "#94a3b8" : "#1d4ed8";
  return `<div style="width:24px;height:24px;border-radius:9999px;background:${bg};color:#fff;font:700 11px/24px sans-serif;text-align:center;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.25)">${label}</div>`;
}

export function NaverPlannerMap({
  clientId,
  places,
  activeDayIndex,
  selectedPlaceId,
  onSelectPlace,
  onFatalError,
}: {
  clientId: string;
  places: Place[];
  activeDayIndex: number | "all";
  selectedPlaceId?: string;
  onSelectPlace?: (placeId: string) => void;
  onFatalError: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapsRef = useRef<NaverMapsApi | null>(null);
  const mapRef = useRef<InstanceType<NaverMapsApi["Map"]> | null>(null);
  const overlaysRef = useRef<Array<{ setMap: (map: unknown) => void }>>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    let resizeTimer: number | undefined;
    const el = containerRef.current;
    if (!el) return;

    loadNaverMapsScript(clientId)
      .then((maps) => {
        if (cancelled) return;
        mapsRef.current = maps;
        mapRef.current = new maps.Map(el, {
          center: new maps.LatLng(33.4996, 126.5312),
          zoom: 11,
          scaleControl: false,
          mapDataControl: false,
          zoomControl: false,
          logoControl: true,
          logoControlOptions: maps.Position
            ? { position: maps.Position.TOP_LEFT }
            : undefined,
        });
        setReady(true);
        requestAnimationFrame(() => mapRef.current?.autoResize?.());
        resizeTimer = window.setTimeout(() => mapRef.current?.autoResize?.(), 200);
        resizeObserver = new ResizeObserver(() => mapRef.current?.autoResize?.());
        resizeObserver.observe(el);
      })
      .catch(() => {
        if (!cancelled) onFatalError();
      });

    return () => {
      cancelled = true;
      if (resizeTimer != null) window.clearTimeout(resizeTimer);
      resizeObserver?.disconnect();
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];
      mapRef.current?.destroy?.();
      mapRef.current = null;
    };
  }, [clientId, onFatalError]);

  useEffect(() => {
    const maps = mapsRef.current;
    const map = mapRef.current;
    if (!maps || !map || !ready) return;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    const numbers = visitNumbers(places, activeDayIndex);
    const withCoords = places.filter((p) => p.lat != null && p.lng != null);
    if (withCoords.length === 0) return;

    const bounds = new maps.LatLngBounds(
      new maps.LatLng(withCoords[0].lat!, withCoords[0].lng!),
      new maps.LatLng(withCoords[0].lat!, withCoords[0].lng!),
    );

    const dayPath: unknown[] = [];
    const dayPlaces = withCoords
      .filter((p) => activeDayIndex === "all" || p.dayIndex === activeDayIndex)
      .slice()
      .sort((a, b) => {
        if (a.dayIndex !== b.dayIndex) return (a.dayIndex ?? 99) - (b.dayIndex ?? 99);
        return a.orderIndex - b.orderIndex;
      });

    for (const place of withCoords) {
      const pos = new maps.LatLng(place.lat!, place.lng!);
      bounds.extend(pos);
      const isCurrentDay = activeDayIndex === "all" || place.dayIndex === activeDayIndex;
      const label = numbers.get(place.id)?.toString() ?? "·";
      const marker = new maps.Marker({
        position: pos,
        map,
        title: place.name,
        zIndex: selectedPlaceId === place.id ? 20 : 10,
        icon: {
          content: markerHtml(label, selectedPlaceId === place.id, !isCurrentDay),
          anchor: new maps.Point(12, 12),
        },
      });
      maps.Event.addListener(marker, "click", () => onSelectPlace?.(place.id));
      overlaysRef.current.push(marker);
    }

    for (const place of dayPlaces) {
      dayPath.push(new maps.LatLng(place.lat!, place.lng!));
    }
    if (dayPath.length >= 2) {
      overlaysRef.current.push(
        new maps.Polyline({
          map,
          path: dayPath,
          strokeColor: "#2563eb",
          strokeWeight: 3,
          strokeOpacity: 0.7,
        }),
      );
    }

    map.fitBounds(bounds);
  }, [places, activeDayIndex, selectedPlaceId, onSelectPlace, ready]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "naver-map-root h-full min-h-[180px] w-full overflow-hidden",
      )}
      role="img"
      aria-label="일정 지도"
    />
  );
}
