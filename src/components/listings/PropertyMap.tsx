import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
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
  areaName?: string;
  title?: string;
  listingId?: string;
  price?: number;
  latitude?: number;
  longitude?: number;
  listings?: PropertyMapListing[];
  /** radius in meters representing the general neighbourhood, default 900m */
  radiusMeters?: number;
}

export interface PropertyMapListing {
  _id: string;
  title?: string;
  price?: number;
  areaName?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
}

const isValidCoordinate = (latitude?: number, longitude?: number): latitude is number =>
  typeof latitude === "number" &&
  typeof longitude === "number" &&
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  latitude >= -90 &&
  latitude <= 90 &&
  longitude >= -180 &&
  longitude <= 180 &&
  !(latitude === 0 && longitude === 0);

const formatPrice = (price?: number) =>
  typeof price === "number"
    ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(price)
    : "Price unavailable";

const FitMapToMarkers = ({ positions }: { positions: Array<[number, number]> }) => {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 15);
      return;
    }
    map.fitBounds(positions, { padding: [32, 32], maxZoom: 15 });
  }, [map, positions]);

  return null;
};

const PropertyMap = ({ areaName, title, listingId, price, latitude, longitude, listings, radiusMeters = 900 }: PropertyMapProps) => {
  const mapListings = useMemo<PropertyMapListing[]>(
    () => listings ?? [{ _id: listingId ?? "single-listing", title, price, areaName, coordinates: { latitude, longitude } }],
    [areaName, latitude, listingId, listings, longitude, price, title],
  );
  const mappedListings = mapListings.filter((listing) =>
    isValidCoordinate(listing.coordinates?.latitude, listing.coordinates?.longitude)
  );
  const positions = mappedListings.map((listing) => [
    listing.coordinates!.latitude!,
    listing.coordinates!.longitude!,
  ] as [number, number]);
  const center = positions[0];
  const isMultiMarkerMode = Array.isArray(listings);

  const [mapActive, setMapActive] = useState(false);

  return (
    <div className="khenx-map-wrap" style={{ borderRadius: 18, overflow: "hidden", border: "1px solid #E2E8F0", position: "relative" }}>
      {mappedListings.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center bg-slate-50 px-6 text-center text-sm text-slate-500">
          {isMultiMarkerMode ? 'No properties with mapped coordinates yet.' : 'Exact location not available for this property yet.'}
        </div>
      ) : (
        <MapContainer
          center={center}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: 280, width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitMapToMarkers positions={positions} />
          {mappedListings.map((listing, index) => {
            const position = positions[index];
            return (
              <Marker key={listing._id} position={position}>
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">{listing.title || listing.areaName || "Property"}</p>
                    <p className="text-sm text-slate-600">{formatPrice(listing.price)}</p>
                    <Link className="text-sm font-semibold text-[#008F7A] hover:underline" to={`/listings/${listing._id}`}>
                      View property
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          {mappedListings.length === 1 && !listings && (
            <Circle
              center={center}
              radius={radiusMeters}
              pathOptions={{ color: "#00C9A7", fillColor: "#00C9A7", fillOpacity: 0.08, weight: 1.5 }}
            />
          )}
        </MapContainer>
      )}

      {mappedListings.length > 0 && !mapActive && (
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