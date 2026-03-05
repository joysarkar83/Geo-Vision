import { MapContainer, TileLayer, Marker, Polygon, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import * as turf from "@turf/turf";
import { useEffect, useState } from "react";

function LocateUser({ setPosition }) {
  const map = useMap();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {

      const coords = [
        pos.coords.latitude,
        pos.coords.longitude
      ];

      setPosition(coords);
      map.setView(coords, 18);

    });
  }, []);

  return null;
}

function RecenterButton({ position }) {
  const map = useMap();

  if (!position) return null;

  return (
    <button
      onClick={() => map.setView(position, 18)}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        padding: "8px 12px",
        background: "white",
        border: "1px solid #ccc",
        cursor: "pointer"
      }}
    >
      My Location
    </button>
  );
}

/* NEW: move map when search result arrives */
function MoveToLocation({ targetLocation }) {
  const map = useMap();

  useEffect(() => {
    if (targetLocation) {
      map.setView(targetLocation, 14);
    }
  }, [targetLocation]);

  return null;
}

export default function MapView({ targetLocation }) {

  const [position, setPosition] = useState(null);
  const [lands, setLands] = useState([]);
  const [activeLand, setActiveLand] = useState(null);

  // Fetch land parcels
  useEffect(() => {

    axios.get("http://localhost:3000/land")
      .then(res => {
        setLands(res.data);
      })
      .catch(err => console.log(err));

  }, []);

  // Detect which parcel user stands on
  useEffect(() => {

    if (!position || lands.length === 0) return;

    const point = turf.point([position[1], position[0]]);

    for (let land of lands) {

      const polygonCoords = [...land.coordinates, land.coordinates[0]];
      const polygon = turf.polygon([polygonCoords]);

      const inside = turf.booleanPointInPolygon(point, polygon);

      if (inside) {
        setActiveLand(land._id);
        return;
      }
    }

    setActiveLand(null);

  }, [position, lands]);

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

        const coords = land.coordinates.map(c => [c[1], c[0]]);
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
                console.log("Land clicked:", land);
              }
            }}
          />
        );

      })}

    </MapContainer>
  );
}