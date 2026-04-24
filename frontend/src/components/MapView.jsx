import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import { getLands } from "../api/api";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView({ targetLocation }) {
  const navigate = useNavigate();

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null); // ✅ inside component

  const [position, setPosition] = useState(null);
  const [lands, setLands] = useState([]);
  const [activeLand, setActiveLand] = useState(null);

  // Create map
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [78.9629, 20.5937],
      zoom: 5,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => mapRef.current?.remove();
  }, []);

  // Fetch lands
  useEffect(() => {
    getLands()
      .then((data) => setLands(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setLands([]);
      });
  }, []);

  // Current location
  useEffect(() => {
    if (!navigator.geolocation || !mapRef.current) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = [
        pos.coords.longitude,
        pos.coords.latitude,
      ];

      setPosition([pos.coords.latitude, pos.coords.longitude]);

      userMarkerRef.current = new mapboxgl.Marker({
        color: "red",
      })
        .setLngLat(coords)
        .addTo(mapRef.current);

      mapRef.current.flyTo({
        center: coords,
        zoom: 18,
      });
    });
  }, []);

  // Search location move + marker move
  useEffect(() => {
    if (
      targetLocation &&
      Array.isArray(targetLocation) &&
      targetLocation.length === 2 &&
      mapRef.current
    ) {
      const coords = [
        targetLocation[1],
        targetLocation[0],
      ];

      mapRef.current.flyTo({
        center: coords,
        zoom: 14,
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLngLat(coords);
      } else {
        userMarkerRef.current = new mapboxgl.Marker({
          color: "red",
        })
          .setLngLat(coords)
          .addTo(mapRef.current);
      }
    }
  }, [targetLocation]);

  // Detect active land
  const computedActiveLand = useMemo(() => {
    if (!position || lands.length === 0) return null;

    const point = turf.point([position[1], position[0]]);

    for (let land of lands) {
      const coords = land.coordinates.map((c) => [
        c[1],
        c[0],
      ]);

      const polygon = turf.polygon([
        [...coords, coords[0]],
      ]);

      if (turf.booleanPointInPolygon(point, polygon)) {
        return land._id;
      }
    }

    return null;
  }, [position, lands]);

  useEffect(() => {
    setActiveLand(computedActiveLand);
  }, [computedActiveLand]);

  // Draw land polygons
  useEffect(() => {
    if (!mapRef.current || lands.length === 0) return;

    const map = mapRef.current;

    const draw = () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      lands.forEach((land) => {
        const sourceId = `source-${land._id}`;
        const layerId = `layer-${land._id}`;

        const coords = land.coordinates.map((c) => [
          c[1],
          c[0],
        ]);

        const closed = [...coords, coords[0]];

        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);

        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [closed],
            },
          },
        });

        map.addLayer({
          id: layerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color":
              activeLand === land._id
                ? "#ff0000"
                : "#0066ff",
            "fill-opacity": 0.45,
          },
        });

        map.on("click", layerId, () => {
          navigate(`/land/${land._id}`);
        });

        const popup = new mapboxgl.Popup().setHTML(`
          <div>
            <strong>Owner:</strong> ${
              land.ownerId?.username || "N/A"
            }<br/>
            <strong>Father:</strong> ${
              land.fatherName || "N/A"
            }<br/>
            <strong>Status:</strong> ${
              land.sellingStatus === 10
                ? "On Sale"
                : "Not for Sale"
            }
          </div>
        `);

        const marker = new mapboxgl.Marker({
          color: "blue",
        })
          .setLngLat(coords[0])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    };

    if (map.isStyleLoaded()) draw();
    else map.on("load", draw);
  }, [lands, activeLand, navigate]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
}