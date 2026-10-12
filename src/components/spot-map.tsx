"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";

export type MapSpot = { id: string; name: string; lat: number; lng: number; score: number; goodHours: number };

function color(goodHours: number) {
  if (goodHours >= 4) return "#12877e";
  if (goodHours >= 1) return "#f5b700";
  return "#8aa0aa";
}

function FitBounds({ spots, origin }: { spots: MapSpot[]; origin: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    const pts: [number, number][] = [[origin.lat, origin.lng], ...spots.map((s) => [s.lat, s.lng] as [number, number])];
    map.fitBounds(pts, { padding: [30, 30], maxZoom: 11 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, spots.length]);
  return null;
}

function FlyTo({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 10), { duration: 0.6 });
  }, [map, target]);
  return null;
}

export default function SpotMap({
  spots,
  origin,
  selected,
  onSelect,
}: {
  spots: MapSpot[];
  origin: { lat: number; lng: number };
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const sel = spots.find((s) => s.id === selected) ?? null;
  return (
    <MapContainer center={[origin.lat, origin.lng]} zoom={8} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds spots={spots} origin={origin} />
      <FlyTo target={sel} />
      <CircleMarker center={[origin.lat, origin.lng]} radius={6} pathOptions={{ color: "#0b3442", fillColor: "#fff", fillOpacity: 1, weight: 3 }}>
        <Tooltip>Ton point de départ</Tooltip>
      </CircleMarker>
      {spots.map((s) => (
        <CircleMarker
          key={s.id}
          center={[s.lat, s.lng]}
          radius={s.id === selected ? 13 : 9}
          pathOptions={{ color: "#0b3442", weight: s.id === selected ? 3 : 1.5, fillColor: color(s.goodHours), fillOpacity: 0.95 }}
          eventHandlers={{ click: () => onSelect(s.id) }}
        >
          <Tooltip>
            {s.name} · {s.goodHours ? `${s.goodHours} h ridables` : "pas ridable"}
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
