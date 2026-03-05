import { useState } from "react";
import axios from "axios";

export default function SearchBar({ onLocationFound }) {

  const [query, setQuery] = useState("");

  const searchLocation = async () => {

    if (!query) return;

    try {

      const res = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: query,
            format: "json",
            limit: 1
          }
        }
      );

      if (res.data.length === 0) {
        alert("Location not found");
        return;
      }

      const lat = parseFloat(res.data[0].lat);
      const lon = parseFloat(res.data[0].lon);

      onLocationFound([lat, lon]);

    } catch (err) {
      console.log(err);
    }

  };

  return (
    <div style={{ display: "flex", gap: "8px" }}>

      <input
        type="text"
        placeholder="Search region..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={searchLocation}>
        Search
      </button>

    </div>
  );
}