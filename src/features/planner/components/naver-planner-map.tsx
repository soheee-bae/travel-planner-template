"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { loadNaverMapsScript, type NaverMapsApi } from "@/lib/naver-maps-script";
import { placesOnDayWithCoords, visitNumbers } from "@/lib/visit-order";
import type { Place } from "@/mocks/fixtures/places";

function markerHtml(label: string, selected: boolean): string {
  const bg = selected ? "#E87820" : "#FF9F43";
  return `<div style="width:28px;height:28px;border-radius:9999px;background:${bg};color:#fff;font:700 12px/28px sans-serif;text-align:center;border:2px solid #fff;box-shadow:0 2px 8px rgba(255,159,67,.4)">${label}</div>`;
}

export function NaverPlannerMap({
  clientId,
  places,
  activeDayIndex,
  selectedPlaceId,
  onSelectPlace,
  onFatalError,
  visible = true,
}: {
  clientId: string;
  places: Place[];
  activeDayIndex: number;
  selectedPlaceId?: string;
  onSelectPlace?: (placeId: string | null) => void;
  onFatalError: () => void;
  visible?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapsRef = useRef<NaverMapsApi | null>(null);
  const mapRef = useRef<InstanceType<NaverMapsApi["Map"]> | null>(null);
  const overlaysRef = useRef<Array<{ setMap: (map: unknown) => void }>>([]);
  const onSelectRef = useRef(onSelectPlace);
  const suppressMapClickRef = useRef(false);
  const fitKeyRef = useRef("");
  const zoomedInRef = useRef(false);
  const [ready, setReady] = useState(false);
  onSelectRef.current = onSelectPlace;

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
          logoControlOptions: maps.Position ? { position: maps.Position.TOP_LEFT } : undefined,
          compassControl: false,
        });
        maps.Event.addListener(mapRef.current, "click", () => {
          if (suppressMapClickRef.current) {
            suppressMapClickRef.current = false;
            return;
          }
          onSelectRef.current?.(null);
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

    const dayPlaces = placesOnDayWithCoords(places, activeDayIndex);
    const numbers = visitNumbers(places, activeDayIndex);
    if (dayPlaces.length === 0) {
      map.setCenter?.(new maps.LatLng(33.4996, 126.5312));
      map.setZoom?.(11);
      fitKeyRef.current = `${activeDayIndex}:`;
      return;
    }

    const path: unknown[] = [];
    const bounds = new maps.LatLngBounds(
      new maps.LatLng(dayPlaces[0].lat!, dayPlaces[0].lng!),
      new maps.LatLng(dayPlaces[0].lat!, dayPlaces[0].lng!),
    );

    for (const place of dayPlaces) {
      const pos = new maps.LatLng(place.lat!, place.lng!);
      bounds.extend(pos);
      path.push(pos);
      const label = numbers.get(place.id)?.toString() ?? "·";
      const selected = selectedPlaceId === place.id;
      const marker = new maps.Marker({
        position: pos,
        map,
        title: place.name,
        zIndex: selected ? 20 : 10,
        icon: {
          content: markerHtml(label, selected),
          anchor: new maps.Point(14, 14),
        },
      });
      maps.Event.addListener(marker, "click", () => {
        suppressMapClickRef.current = true;
        onSelectRef.current?.(place.id);
      });
      overlaysRef.current.push(marker);
    }

    if (path.length >= 2) {
      overlaysRef.current.push(
        new maps.Polyline({
          map,
          path,
          strokeColor: "#FF9F43",
          strokeWeight: 3,
          strokeOpacity: 0.95,
          strokeStyle: "shortdash",
          clickable: false,
        }),
      );
    }

    const fitKey = `${activeDayIndex}:${dayPlaces.map((p) => p.id).join(",")}`;
    if (fitKeyRef.current !== fitKey) {
      fitKeyRef.current = fitKey;
      if (dayPlaces.length === 1) {
        map.setCenter?.(path[0]);
        map.setZoom?.(14);
      } else {
        map.fitBounds(bounds);
      }
    }

    const highlighted = dayPlaces.find((p) => p.id === selectedPlaceId);
    if (highlighted) {
      map.panTo?.(new maps.LatLng(highlighted.lat!, highlighted.lng!));
      map.setZoom?.(16);
      zoomedInRef.current = true;
    } else if (zoomedInRef.current) {
      zoomedInRef.current = false;
      if (dayPlaces.length === 1) {
        map.setCenter?.(path[0]);
        map.setZoom?.(14);
      } else if (dayPlaces.length > 1) {
        map.fitBounds(bounds);
      }
    }
  }, [places, activeDayIndex, selectedPlaceId, ready]);

  useEffect(() => {
    if (!visible || !ready) return;
    const frame = window.requestAnimationFrame(() => mapRef.current?.autoResize?.());
    const timer = window.setTimeout(() => mapRef.current?.autoResize?.(), 80);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [visible, ready]);

  return (
    <div
      ref={containerRef}
      className={cn("naver-map-root h-full min-h-[180px] w-full overflow-hidden")}
      role="img"
      aria-label="일정 지도"
    />
  );
}
