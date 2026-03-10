import { MapContainer, TileLayer, Marker, Polygon, useMap, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getLands } from "../api/api";
import * as turf from "@turf/turf";
import { useEffect, useState, useMemo } from "react";

function LocateUser({ setPosition }) {
  const map = useMap();

  useEffect(() => {
    let cancelled = false;

    if (!navigator.geolocation) {
      return () => {
        cancelled = true;
      };
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      if (cancelled) return;

      const coords = [
        pos.coords.latitude,
        pos.coords.longitude
      ];

      setPosition(coords);
      map.whenReady(() => {
        if (!cancelled) {
          map.setView(coords, 18);
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [setPosition, map]);

  return null;
}

function RecenterButton({ position }) {
  const map = useMap();

  if (!position) return null;

  return (
    <button
      onClick={() => map.setView(position, 18)}
      className="map-recenter-button"
    >
      <div className="py-3 px-3">📍</div>
    </button>
  );
}

/* NEW: move map when search result arrives */
function MoveToLocation({ targetLocation }) {
  const map = useMap();

  useEffect(() => {
    if (Array.isArray(targetLocation) && targetLocation.length === 2) {
      map.whenReady(() => {
        map.setView(targetLocation, 14);
      });
    }
  }, [targetLocation, map]);

  return null;
}

export default function MapView({ targetLocation }) {

  const [position, setPosition] = useState(null);
  const [lands, setLands] = useState([]);
  const [activeLand, setActiveLand] = useState(null);

  // Fetch land parcels
  useEffect(() => {
    getLands()
      .then((data) => setLands(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to fetch lands:", err);
        setLands([]);
      });
  }, []);

  // Compute active land
  const computedActiveLand = useMemo(() => {
    if (!position || lands.length === 0) return null;

    const point = turf.point([position[1], position[0]]);

    for (let land of lands) {

      const swappedCoords = land.coordinates.map(c => [c[1], c[0]]); // DB [lat, lng] -> [lng, lat] for Turf
      const closedCoords = [...swappedCoords, swappedCoords[0]]; // Close the polygon
      const polygon = turf.polygon([closedCoords]);

      const inside = turf.booleanPointInPolygon(point, polygon);

      if (inside) {
        return land._id;
      }
    }

    return null;
  }, [position, lands]);

  useEffect(() => {
    setActiveLand(computedActiveLand);
  }, [computedActiveLand]);

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
    >

      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocateUser setPosition={setPosition} />

      <RecenterButton position={position} />

      {/* NEW: reacts to search */}
      <MoveToLocation targetLocation={targetLocation} />

      {position && <Marker position={position} />}

      {lands.map((land) => {

        const coords = land.coordinates; // DB is [lat, lng], Leaflet expects [lat, lng]
        const isActive = activeLand === land._id;

        return (
          <Polygon
            key={land._id}
            positions={coords}
            pathOptions={{
              color: isActive ? "red" : "blue",
              weight: 2
            }}
            eventHandlers={{
              click: () => {
                // placeholder for click behavior
              }
            }}
          >
            <Popup>
              <div>
                <strong>Owner:</strong> {land.ownerId?.username}<br/>
                <strong>Father:</strong> {land.fatherName}<br/>
                <strong>Status:</strong> {land.sellingStatus === 10 ? "On Sale" : "Not for Sale"}
              </div>
            </Popup>
          </Polygon>
        );

      })}

    </MapContainer>
  );
}
