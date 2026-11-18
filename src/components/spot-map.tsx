"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { Circle, MapContainer, Marker, TileLayer, Tooltip, ZoomControl, useMap } from "react-leaflet";

export type MapStatus = "go" | "maybe" | "no" | "calm";
export type MapSpot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: MapStatus;
  /** Chiffre affiché dans la pastille : vent moyen (nds) ou hauteur de vague */
  value: string | null;
  /** Direction du vent (degrés, d'où il vient) pour la petite flèche */
  dir: number | null;
  distance: number;
};

const STATUS_COLOR: Record<MapStatus, { bg: string; ring: string; text: string }> = {
  go: { bg: "#10a37f", ring: "#0b7a5f", text: "#fff" },
  maybe: { bg: "#f5b700", ring: "#c48f00", text: "#0b3442" },
  no: { bg: "#e5534b", ring: "#b33b34", text: "#fff" },
  calm: { bg: "#ffffff", ring: "#9fb3bc", text: "#55707c" },
};

/** Pastille d'un spot : couleur du verdict, vent ou houle au centre, flèche du vent ; nom affiché quand il est choisi. */
function spotIcon(s: MapSpot, selected: boolean) {
  const c = STATUS_COLOR[s.status];
  const size = selected ? 44 : 34;
  const arrow =
    s.dir != null
      ? `<span class="spot-pin-arrow" style="transform:rotate(${(s.dir + 180) % 360}deg)"><svg viewBox="0 0 10 14" width="9" height="12"><path d="M5 0 L10 9 L5 7 L0 9 Z" fill="${c.ring}"/></svg></span>`
      : "";
  const label = selected ? `<span class="spot-pin-label">${escapeHtml(s.name)}</span>` : "";
  return L.divIcon({
    className: "spot-pin-wrap",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span class="spot-pin${selected ? " is-selected" : ""}" style="--pin:${c.bg};--pin-ring:${c.ring};--pin-text:${c.text};width:${size}px;height:${size}px">${arrow}<span class="spot-pin-value">${s.value ?? ""}</span></span>${label}`,
  });
}

const ORIGIN_ICON = L.divIcon({
  className: "spot-pin-wrap",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  html: `<span class="origin-pin"><span class="origin-pulse"></span></span>`,
});

function escapeHtml(t: string) {
  return t.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
}

/** Cadre la carte sur les spots du rayon (et le point de départ), sans dézoomer sur tout le pays. */
function FitBounds({ spots, origin, radiusKm }: { spots: MapSpot[]; origin: { lat: number; lng: number }; radiusKm: number }) {
  const map = useMap();
  const key = `${origin.lat},${origin.lng},${radiusKm},${spots.length}`;
  useEffect(() => {
    const pts = L.latLngBounds([[origin.lat, origin.lng]]);
    for (const s of spots) if (s.distance <= radiusKm * 1.05) pts.extend([s.lat, s.lng]);
    if (pts.getNorthEast().equals(pts.getSouthWest())) {
      map.setView([origin.lat, origin.lng], 10);
    } else {
      map.fitBounds(pts, { padding: [36, 36], maxZoom: 12 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

function FlyTo({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 11), { duration: 0.6 });
  }, [map, target]);
  return null;
}

export default function SpotMap({
  spots,
  origin,
  radiusKm,
  selected,
  onSelect,
}: {
  spots: MapSpot[];
  origin: { lat: number; lng: number };
  radiusKm: number;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const sel = spots.find((s) => s.id === selected) ?? null;
  // Le spot choisi passe au-dessus des autres
  const ordered = useMemo(() => [...spots].sort((a, b) => Number(a.id === selected) - Number(b.id === selected)), [spots, selected]);

  return (
    <MapContainer
      center={[origin.lat, origin.lng]}
      zoom={10}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl
      className="spot-map h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      <ZoomControl position="bottomright" />
      <FitBounds spots={spots} origin={origin} radiusKm={radiusKm} />
      <FlyTo target={sel} />

      {/* Zone de recherche */}
      <Circle
        center={[origin.lat, origin.lng]}
        radius={radiusKm * 1000}
        pathOptions={{ color: "#1688c8", weight: 1.5, dashArray: "6 6", fillColor: "#1688c8", fillOpacity: 0.04 }}
        interactive={false}
      />

      <Marker position={[origin.lat, origin.lng]} icon={ORIGIN_ICON} keyboard={false} zIndexOffset={-100}>
        <Tooltip direction="top" offset={[0, -10]}>Ton point de départ</Tooltip>
      </Marker>

      {ordered.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={spotIcon(s, s.id === selected)}
          zIndexOffset={s.id === selected ? 1000 : s.status === "go" ? 500 : s.status === "maybe" ? 300 : 0}
          eventHandlers={{ click: () => onSelect(s.id) }}
          title={s.name}
        >
          {s.id !== selected && (
            <Tooltip direction="top" offset={[0, -16]}>
              <strong>{s.name}</strong> · {s.distance} km
            </Tooltip>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
