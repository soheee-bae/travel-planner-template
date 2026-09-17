"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { loadNaverMapsScript, type NaverMapsApi } from "@/lib/naver-maps-script";
import { uniqueMapPlaces, isMapSpotSelected, visitNumbers } from "@/lib/visit-order";
import type { Place } from "@/mocks/fixtures/places";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pinLabelHtml(name: string): string {
  return `<div style="margin-top:2px;max-width:72px;padding:1px 5px;border-radius:6px;background:rgba(255,255,255,.96);color:#4A4543;font:700 10px/14px sans-serif;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.12);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(name)}</div>`;
}

function markerHtml(label: string, selected: boolean, name?: string): string {
  const bg = selected ? "#E87820" : "#FF9F43";
  const pin = `<div style="width:28px;height:28px;border-radius:9999px;background:${bg};color:#fff;font:700 12px/28px sans-serif;text-align:center;border:2px solid #fff;box-shadow:0 2px 8px rgba(255,159,67,.4)">${label}</div>`;
  if (!name) return pin;
  return `<div style="display:flex;width:76px;flex-direction:column;align-items:center">${pin}${pinLabelHtml(name)}</div>`;
}

function otherMarkerHtml(selected: boolean, name?: string): string {
  const bg = selected ? "#8C8885" : "#C4C0BC";
  const pin = `<div style="width:18px;height:18px;border-radius:9999px;background:${bg};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.2)"></div>`;
  if (!name) return pin;
  return `<div style="display:flex;width:76px;flex-direction:column;align-items:center">${pin}${pinLabelHtml(name)}</div>`;
}

function focusLatLng(
  map: InstanceType<NaverMapsApi["Map"]>,
  maps: NaverMapsApi,
  lat: number,
  lng: number,
  zoom: number,
) {
  const pos = new maps.LatLng(lat, lng);
  if (typeof map.morph === "function") {
    map.morph(pos, zoom);
    return;
  }
  map.setCenter?.(pos);
  map.setZoom?.(zoom);
}

function hasSize(el: HTMLElement): boolean {
  return el.clientWidth > 0 && el.clientHeight > 0;
}

function waitForElementSize(el: HTMLElement, timeoutMs = 2_000): Promise<void> {
  if (hasSize(el)) return Promise.resolve();
  return new Promise((resolve) => {
    const observer = new ResizeObserver(() => {
      if (hasSize(el)) {
        cleanup();
        resolve();
      }
    });
    const timer = window.setTimeout(() => {
      cleanup();
      resolve();
    }, timeoutMs);
    const cleanup = () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
    observer.observe(el);
  });
}

export function NaverPlannerMap({
  clientId,
  places,
  activeDayIndex,
  selectedPlaceId,
  onSelectPlace,
  onFatalError,
  visible = true,
  focusNonce = 0,
  expanded = false,
}: {
  clientId: string;
  places: Place[];
  activeDayIndex: number;
  selectedPlaceId?: string;
  onSelectPlace?: (placeId: string | null) => void;
  onFatalError: () => void;
  visible?: boolean;
  focusNonce?: number;
  expanded?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapsRef = useRef<NaverMapsApi | null>(null);
  const mapRef = useRef<InstanceType<NaverMapsApi["Map"]> | null>(null);
  const overlaysRef = useRef<Array<{ setMap: (map: unknown) => void }>>([]);
  const onSelectRef = useRef(onSelectPlace);
  const suppressMapClickRef = useRef(false);
  const [ready, setReady] = useState(false);
  onSelectRef.current = onSelectPlace;

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    let resizeTimer: number | undefined;
    const el = containerRef.current;
    if (!el) return;

    void (async () => {
      await waitForElementSize(el);
      if (cancelled) return;
      let maps: NaverMapsApi;
      try {
        maps = await loadNaverMapsScript(clientId);
      } catch {
        if (!cancelled) onFatalError();
        return;
      }
      if (cancelled) return;
      mapsRef.current = maps;
      el.replaceChildren();
      try {
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
      } catch {
        if (!cancelled) onFatalError();
        return;
      }
      maps.Event.addListener(mapRef.current, "click", () => {
        if (suppressMapClickRef.current) {
          suppressMapClickRef.current = false;
          return;
        }
        onSelectRef.current?.(null);
      });
      setReady(true);
      const resize = () => mapRef.current?.autoResize?.();
      requestAnimationFrame(resize);
      resizeTimer = window.setTimeout(resize, 200);
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(el);
    })();

    return () => {
      cancelled = true;
      if (resizeTimer != null) window.clearTimeout(resizeTimer);
      resizeObserver?.disconnect();
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];
      mapRef.current?.destroy?.();
      mapRef.current = null;
      mapsRef.current = null;
      el.replaceChildren();
    };
  }, [clientId, onFatalError]);

  useEffect(() => {
    const maps = mapsRef.current;
    const map = mapRef.current;
    if (!maps || !map || !ready) return;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    const { dayPlaces, otherPlaces } = uniqueMapPlaces(places, activeDayIndex);
    const numbers = visitNumbers(places, activeDayIndex);

    for (const place of otherPlaces) {
      const selected = isMapSpotSelected(place, places, selectedPlaceId);
      const marker = new maps.Marker({
        position: new maps.LatLng(place.lat!, place.lng!),
        map,
        title: place.name,
        zIndex: selected ? 18 : 4,
        icon: {
          content: otherMarkerHtml(selected, expanded ? place.name : undefined),
          anchor: expanded ? new maps.Point(38, 9) : new maps.Point(9, 9),
        },
      });
      maps.Event.addListener(marker, "click", () => {
        suppressMapClickRef.current = true;
        onSelectRef.current?.(place.id);
      });
      overlaysRef.current.push(marker);
    }

    const path: unknown[] = [];
    for (const place of dayPlaces) {
      const pos = new maps.LatLng(place.lat!, place.lng!);
      path.push(pos);
      const label = numbers.get(place.id)?.toString() ?? "·";
      const selected = isMapSpotSelected(place, places, selectedPlaceId);
      const marker = new maps.Marker({
        position: pos,
        map,
        title: place.name,
        zIndex: selected ? 20 : 10,
        icon: {
          content: markerHtml(label, selected, expanded ? place.name : undefined),
          anchor: expanded ? new maps.Point(38, 14) : new maps.Point(14, 14),
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
  }, [places, activeDayIndex, selectedPlaceId, ready, expanded]);

  useEffect(() => {
    const maps = mapsRef.current;
    const map = mapRef.current;
    if (!maps || !map || !ready) return;

    const run = () => {
      map.autoResize?.();
      const highlighted = places.find((place) => place.id === selectedPlaceId);
      if (highlighted?.lat != null && highlighted.lng != null) {
        focusLatLng(map, maps, highlighted.lat, highlighted.lng, 16);
        return;
      }

      const dayPlaces = uniqueMapPlaces(places, activeDayIndex).dayPlaces;
      if (dayPlaces.length === 0) {
        map.setCenter?.(new maps.LatLng(33.4996, 126.5312));
        map.setZoom?.(11);
        return;
      }
      if (dayPlaces.length === 1) {
        focusLatLng(map, maps, dayPlaces[0].lat!, dayPlaces[0].lng!, 14);
        return;
      }
      const bounds = new maps.LatLngBounds(
        new maps.LatLng(dayPlaces[0].lat!, dayPlaces[0].lng!),
        new maps.LatLng(dayPlaces[0].lat!, dayPlaces[0].lng!),
      );
      for (const place of dayPlaces) {
        bounds.extend(new maps.LatLng(place.lat!, place.lng!));
      }
      map.fitBounds(
        bounds,
        expanded ? { top: 72, right: 56, bottom: 40, left: 40 } : { top: 28, right: 40, bottom: 28, left: 28 },
      );
    };

    const frame = window.requestAnimationFrame(run);
    return () => window.cancelAnimationFrame(frame);
  }, [places, activeDayIndex, selectedPlaceId, ready, focusNonce, expanded]);

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
