import { useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet's default marker icons don't resolve correctly under most bundlers —
// this rebuilds the icon URLs from the installed package so pins render.
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface PropertyMapProps {
  areaName: string;
  latitude?: number;
  longitude?: number;
  /** radius in meters representing the general neighbourhood, default 900m */
  radiusMeters?: number;
}

// Fallback centroid used only when a listing has no coordinates yet —
// keeps the map from crashing, but the pin should be swapped in once
// listings carry real lat/lng.
const LAGOS_FALLBACK: [number, number] = [6.4531, 3.3958]; // Lagos Island

const PropertyMap = ({ areaName, latitude, longitude, radiusMeters = 900 }: PropertyMapProps) => {
  const hasCoords = typeof latitude === "number" && typeof longitude === "number";
  const center: [number, number] = hasCoords ? [latitude!, longitude!] : LAGOS_FALLBACK;

  // On touch devices, a one-finger drag on the map would otherwise hijack the
  // page's scroll gesture. Require a tap to "activate" the map first — the
  // overlay below only renders/intercepts touches on coarse-pointer devices
  // (see CSS), so desktop/mouse users are unaffected.
  const [mapActive, setMapActive] = useState(false);

  return (
    <div className="khenx-map-wrap" style={{ borderRadius: 18, overflow: "hidden", border: "1px solid #E2E8F0", position: "relative" }}>
      <MapContainer
        center={center}
        zoom={hasCoords ? 15 : 12}
        scrollWheelZoom={false}
        style={{ height: 280, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={center}
          radius={radiusMeters}
          pathOptions={{ color: "#00C9A7", fillColor: "#00C9A7", fillOpacity: 0.08, weight: 1.5 }}
        />
        <Marker position={center}>
          <Popup>{areaName}, Lagos</Popup>
        </Marker>
      </MapContainer>

      {!mapActive && (
        <div
          className="khenx-map-tap-overlay"
          role="button"
          aria-label="Tap to interact with map"
          onClick={() => setMapActive(true)}
          onTouchStart={() => setMapActive(true)}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 4,
            cursor: "pointer",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15,23,42,0.12)",
          }}
        >
          <span
            style={{
              background: "rgba(15,23,42,0.8)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              padding: "8px 16px",
              borderRadius: 20,
              backdropFilter: "blur(4px)",
              whiteSpace: "nowrap",
            }}
          >
            Tap to interact with map
          </span>
        </div>
      )}

      {!hasCoords && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            right: 10,
            background: "rgba(15,23,42,0.85)",
            color: "#F1F5F9",
            fontSize: 11,
            borderRadius: 8,
            padding: "6px 10px",
            backdropFilter: "blur(4px)",
            zIndex: 6,
          }}
        >
          Showing approximate area — exact coordinates not yet set for this listing.
        </div>
      )}

      <style>{`
        .khenx-map-tap-overlay {
          display: none;
        }
        /* Only intercept the first touch on touch/coarse-pointer devices —
           mouse users can drag the map immediately without an extra click. */
        @media (pointer: coarse) {
          .khenx-map-tap-overlay {
            display: flex;
          }
        }
        @media (max-width: 480px) {
          .khenx-map-wrap .leaflet-container {
            height: 220px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PropertyMap;