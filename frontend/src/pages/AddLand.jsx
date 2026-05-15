import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { addLand, uploadDocs } from "../api/api";
import Layout from "../components/Layout";
import TextField from "../components/ui/TextField";
import PrimaryButton from "../components/ui/PrimaryButton";
import { isLoggedIn } from "../utils/auth";

import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

function AddLand() {
  const navigate = useNavigate();

  const mapContainer = useRef(null);
  const map = useRef(null);

  const [form, setForm] = useState({
    fatherName: "",
    dob: "",
    address: "",
    landArea: "",
    pan: "",
    regNum: "",
    coordinates: "",
    landmark: "",
    propertyValue: "",
    status: 11,
    files: [],
  });

  // Login check
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  }, [navigate]);

  // Map Initialization
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [81.76137, 21.13016],
      zoom: 14,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
    });

    map.current.addControl(draw);

    map.current.on("draw.create", updateArea);
    map.current.on("draw.update", updateArea);

    function updateArea() {
      const data = draw.getAll();

      if (data.features.length > 0) {
        const coords =
          data.features[0].geometry.coordinates[0];

        // Convert [lng, lat] → [lat, lng]
        const formatted = coords.map((coord) => [
          coord[1],
          coord[0],
        ]);

        setForm((prev) => ({
          ...prev,
          coordinates: JSON.stringify(formatted),
        }));
      }
    }
  }, []);

  // Submit Land
  const handleSubmit = async () => {
    if (!form.coordinates) {
      alert("Please draw a land parcel on map.");
      return;
    }

    const coordinates = JSON.parse(form.coordinates);

    let folderId = null;
    let uploadedFiles = [];

    // Upload docs
    if (form.files.length > 0) {
      const uploadResult = await uploadDocs(form.files);

      if (uploadResult.error) {
        alert("File upload failed: " + uploadResult.error);
        return;
      }

      folderId = uploadResult.folderId;
      uploadedFiles = uploadResult.files;
    }

    const payload = {
      fatherName: form.fatherName,
      dob: form.dob,
      address: form.address,
      landArea: form.landArea,
      pan: form.pan,
      regNum: form.regNum,
      coordinates,
      landmark: form.landmark,
      propertyValue: form.propertyValue,
      sellingStatus: form.status,
      driveFolder: folderId,
      documents: uploadedFiles,
    };

    const result = await addLand(payload);

    alert(result.message || result.error || "Unable to submit land details.");

    if (!result.error) {
      navigate("/");
    }
  };

  return (
    <Layout>
      <section className="card">
        <div className="card-header">
          <div>
            <p className="section-eyebrow">New record</p>
            <h1 className="card-title">Add land parcel</h1>
            <p className="card-subtitle">
              Capture ownership and valuation details for a new land parcel.
            </p>
          </div>
        </div>

        <div className="form-grid mb-5">

          <TextField
            label="Father name"
            placeholder="Father Name"
            value={form.fatherName}
            onChange={(e) =>
              setForm({ ...form, fatherName: e.target.value })
            }
          />

          <div className="field">
            <label className="field-label">Date of birth</label>

            <input
              className="field-input"
              type="date"
              value={form.dob}
              onChange={(e) =>
                setForm({ ...form, dob: e.target.value })
              }
            />
          </div>

          <TextField
            label="Address"
            placeholder="Address"
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
          />

          <TextField
            label="Land area (Acres)"
            type="number"
            placeholder="Land Area"
            value={form.landArea}
            onChange={(e) =>
              setForm({
                ...form,
                landArea: Number(e.target.value),
              })
            }
          />

          <TextField
            label="PAN"
            placeholder="PAN"
            value={form.pan}
            onChange={(e) =>
              setForm({ ...form, pan: e.target.value })
            }
          />

          <TextField
            label="Registration number"
            placeholder="Registration Number"
            value={form.regNum}
            onChange={(e) =>
              setForm({ ...form, regNum: e.target.value })
            }
          />

          <TextField
            label="Property value (Lakhs)"
            type="number"
            placeholder="Property Value"
            value={form.propertyValue}
            onChange={(e) =>
              setForm({
                ...form,
                propertyValue: Number(e.target.value),
              })
            }
          />

          <TextField
            label="Landmark"
            placeholder="Nearby Landmark"
            value={form.landmark}
            onChange={(e) =>
              setForm({
                ...form,
                landmark: e.target.value,
              })
            }
          />

          {/* STATUS */}
          <div className="field">
            <label className="field-label">Status</label>

            <div className="radio-group">

              <label className="radio-label">
                <input
                  type="radio"
                  name="status"
                  value={10}
                  checked={form.status === 10}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: Number(e.target.value),
                    })
                  }
                />
                <span>On Sale</span>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="status"
                  value={11}
                  checked={form.status === 11}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: Number(e.target.value),
                    })
                  }
                />
                <span>Not for Sale</span>
              </label>

            </div>
          </div>

        </div>

        {/* MAP DRAWING */}
        <div className="field mt-4">
          <label className="field-label">
            Draw Land Parcel
          </label>

          <div
            ref={mapContainer}
            style={{
              width: "100%",
              height: "500px",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          />

          <p className="field-caption">
            Use polygon tool to draw land parcel.
          </p>
        </div>

        {/* DOCUMENTS */}
        <div className="field mt-4">
          <label className="field-label">Documents</label>

          <input
            type="file"
            multiple
            className="field-input"
            onChange={(e) =>
              setForm({
                ...form,
                files: Array.from(e.target.files),
              })
            }
          />

          <p className="field-caption">
            Upload supporting documents.
          </p>
        </div>

        {/* SUBMIT */}
        <div className="form-footer">

          <PrimaryButton
            type="button"
            onClick={handleSubmit}
          >
            Submit
          </PrimaryButton>

          <span className="form-meta">
            Parcel coordinates are generated automatically from the map.
          </span>

        </div>

      </section>
    </Layout>
  );
}

export default AddLand;