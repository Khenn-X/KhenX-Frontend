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

  return (
    <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid #E2E8F0", position: "relative" }}>
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
          }}
        >
          Showing approximate area — exact coordinates not yet set for this listing.
        </div>
      )}
    </div>
  );
};

export default PropertyMap;