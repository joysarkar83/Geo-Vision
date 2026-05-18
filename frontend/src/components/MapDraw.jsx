import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapDraw({ value, onChange }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const drawRef = useRef(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (mapRef.current) return;

    // Initialize Map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [78.9629, 20.5937], // Default to center of India
      zoom: 4,
    });

    // Initialize Draw Control
    drawRef.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: "draw_polygon",
    });

    mapRef.current.addControl(drawRef.current);
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!mapRef.current) return;
          mapRef.current.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            zoom: 15,
          });
        },
        (err) => console.warn("Location access denied or failed", err)
      );
    }

    const updateCoordinates = () => {
      if (!drawRef.current) return;
      const data = drawRef.current.getAll();
      if (data.features.length > 0) {
        // We only care about the first polygon drawn for simplicity
        const feature = data.features[0];
        if (feature.geometry.type === "Polygon") {
          const coords = feature.geometry.coordinates[0];
          // Mapbox returns [lng, lat], our format is "lat,lng; lat,lng"
          const formattedCoords = coords
            .map((coord) => `${coord[1].toFixed(6)},${coord[0].toFixed(6)}`)
            .join("; ");

          isUpdatingRef.current = true;
          onChange(formattedCoords);
        }
      } else {
        isUpdatingRef.current = true;
        onChange("");
      }
    };

    mapRef.current.on("draw.create", updateCoordinates);
    mapRef.current.on("draw.update", updateCoordinates);
    mapRef.current.on("draw.delete", updateCoordinates);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle value changes from external (e.g. form cleared)
  useEffect(() => {
    if (!value && drawRef.current) {
      if (isUpdatingRef.current) {
        isUpdatingRef.current = false;
        return;
      }
      drawRef.current.deleteAll();
    }
  }, [value]);

  return (
    <div className="field mt-4">
      <label className="field-label">Draw Land Area</label>
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "400px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.12)" }}
      />
      <p className="field-caption mt-2">
        Use the polygon tool on the map to draw the boundaries of the land parcel.
      </p>

      {value && (
        <div className="mt-2 text-xs text-gray-500 break-words" style={{ color: "var(--text-muted)" }}>
          <strong>Generated Coordinates:</strong> {value}
        </div>
      )}
    </div>
  );
}
