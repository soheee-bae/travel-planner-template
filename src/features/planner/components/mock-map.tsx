"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { visitNumbers } from "@/lib/visit-order";
import type { Place } from "@/mocks/fixtures/places";

const TILE_SIZE = 256;
const JEJU = { minLat: 33.12, maxLat: 33.58, minLng: 126.14, maxLng: 126.98 };

const CATEGORY_DOT: Record<Place["category"], string> = {
  관광: "bg-category-sight-bg",
  맛집: "bg-category-food-bg",
  카페: "bg-category-cafe-bg",
  쇼핑: "bg-category-shop-bg",
  숙소: "bg-category-stay-bg",
  교통: "bg-category-transport-bg",
  기타: "bg-category-move-bg",
};

function latLngToWorld(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const scale = TILE_SIZE * 2 ** zoom;
  const x = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function boundsOf(places: Place[]): typeof JEJU {
  const coords = places.filter((p) => p.lat != null && p.lng != null);
  if (coords.length === 0) return JEJU;
  const lats = coords.map((p) => p.lat!);
  const lngs = coords.map((p) => p.lng!);
  const pad = 0.03;
  return {
    minLat: Math.min(...lats) - pad,
    maxLat: Math.max(...lats) + pad,
    minLng: Math.min(...lngs) - pad,
    maxLng: Math.max(...lngs) + pad,
  };
}

function pickZoom(bbox: typeof JEJU, width: number, height: number): number {
  for (let zoom = 13; zoom >= 8; zoom -= 1) {
    const sw = latLngToWorld(bbox.minLat, bbox.minLng, zoom);
    const ne = latLngToWorld(bbox.maxLat, bbox.maxLng, zoom);
    const w = Math.abs(ne.x - sw.x);
    const h = Math.abs(ne.y - sw.y);
    if (w <= width * 1.35 && h <= height * 1.35) return zoom;
  }
  return 8;
}

/**
 * iframe은 AppShell transform 안에서 빈 화면이 되는 경우가 있어
 * OSM 래스터 타일을 img로 깐다.
 */
export function MockMap({
  places,
  activeDayIndex,
  selectedPlaceId,
  onSelectPlace,
  className,
}: {
  places: Place[];
  activeDayIndex: number | "all";
  selectedPlaceId?: string;
  onSelectPlace?: (placeId: string) => void;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 390, h: 180 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () => setSize({ w: Math.max(1, el.clientWidth), h: Math.max(1, el.clientHeight) });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const visiblePlaces =
    activeDayIndex === "all" ? places : places.filter((p) => p.dayIndex === activeDayIndex);
  const markerPlaces = (visiblePlaces.length > 0 ? visiblePlaces : places).filter(
    (p) => p.lat != null && p.lng != null,
  );
  const bbox = boundsOf(markerPlaces);
  const zoom = pickZoom(bbox, size.w, size.h);
  const sw = latLngToWorld(bbox.minLat, bbox.minLng, zoom);
  const ne = latLngToWorld(bbox.maxLat, bbox.maxLng, zoom);
  const viewLeft = Math.min(sw.x, ne.x);
  const viewTop = Math.min(sw.y, ne.y);
  const viewW = Math.max(1, Math.abs(ne.x - sw.x));
  const viewH = Math.max(1, Math.abs(ne.y - sw.y));
  const scale = Math.max(size.w / viewW, size.h / viewH);
  const offsetX = (size.w - viewW * scale) / 2;
  const offsetY = (size.h - viewH * scale) / 2;

  const tileMinX = Math.floor(viewLeft / TILE_SIZE);
  const tileMaxX = Math.floor((viewLeft + viewW) / TILE_SIZE);
  const tileMinY = Math.floor(viewTop / TILE_SIZE);
  const tileMaxY = Math.floor((viewTop + viewH) / TILE_SIZE);
  const maxTile = 2 ** zoom;

  const tiles: Array<{ key: string; src: string; left: number; top: number }> = [];
  for (let ty = tileMinY; ty <= tileMaxY; ty += 1) {
    if (ty < 0 || ty >= maxTile) continue;
    for (let tx = tileMinX; tx <= tileMaxX; tx += 1) {
      const wrappedX = ((tx % maxTile) + maxTile) % maxTile;
      tiles.push({
        key: `${zoom}-${wrappedX}-${ty}`,
        src: `https://basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${wrappedX}/${ty}.png`,
        left: tx * TILE_SIZE - viewLeft,
        top: ty * TILE_SIZE - viewTop,
      });
    }
  }

  const numbers = visitNumbers(places, activeDayIndex);

  return (
    <div
      ref={rootRef}
      className={cn("osm-map-root relative h-full min-h-[180px] w-full overflow-hidden bg-[#dbe4d8]", className)}
      role="img"
      aria-label="일정 지도"
    >
      <div className="absolute inset-0 overflow-hidden">
        {tiles.map((tile) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={tile.key}
            alt=""
            src={tile.src}
            draggable={false}
            className="absolute max-w-none"
            style={{
              left: offsetX + tile.left * scale,
              top: offsetY + tile.top * scale,
              width: TILE_SIZE * scale,
              height: TILE_SIZE * scale,
            }}
          />
        ))}
      </div>
      {markerPlaces.map((place) => {
        const point = latLngToWorld(place.lat!, place.lng!, zoom);
        const left = offsetX + (point.x - viewLeft) * scale;
        const top = offsetY + (point.y - viewTop) * scale;
        const isCurrentDay = activeDayIndex === "all" || place.dayIndex === activeDayIndex;
        const isUnassigned = place.dayIndex == null;
        return (
          <button
            key={place.id}
            type="button"
            onClick={() => onSelectPlace?.(place.id)}
            aria-label={place.name}
            title={place.name}
            className={cn(
              "absolute z-10 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold shadow-sm",
              isUnassigned
                ? "bg-muted-foreground/70 text-white"
                : cn(CATEGORY_DOT[place.category], "text-foreground"),
              !isCurrentDay && !isUnassigned && "opacity-30",
              selectedPlaceId === place.id && "scale-125 ring-2 ring-primary",
            )}
            style={{ left, top }}
          >
            {numbers.get(place.id) ?? (isUnassigned ? "·" : "?")}
          </button>
        );
      })}
      <p className="pointer-events-none absolute right-1.5 bottom-1 z-10 text-[8px] leading-3 text-[#555555]/80">
        © OpenStreetMap, © CARTO
      </p>
    </div>
  );
}
