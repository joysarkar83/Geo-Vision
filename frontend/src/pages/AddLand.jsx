import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addLand } from "../api/api";
import Layout from "../components/Layout";
import TextField from "../components/ui/TextField";
import PrimaryButton from "../components/ui/PrimaryButton";
import { isLoggedIn } from "../utils/auth";

function AddLand() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ownerName: "",
    fatherName: "",
    dob: "",
    address: "",
    landArea: "",
    aadhar: "",
    pan: "",
    regNum: "",
    phone: "",
    email: "",
    coordinates: "",
    propertyValue: "",
    status: "",
  });

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async () => {
    const payload = {
      ...form,
      coordinates: form.coordinates.split(",").map(Number),
    };

    const result = await addLand(payload);

    alert(result.message);
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

        <div className="form-grid">
          <TextField
            label="Owner name"
            placeholder="Owner Name"
            value={form.ownerName}
            onChange={(e) =>
              setForm({ ...form, ownerName: e.target.value })
            }
          />

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
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
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
            label="Land area"
            type="number"
            placeholder="Land Area"
            value={form.landArea}
            onChange={(e) =>
              setForm({ ...form, landArea: Number(e.target.value) })
            }
          />

          <TextField
            label="Aadhar"
            type="number"
            placeholder="Aadhar"
            value={form.aadhar}
            onChange={(e) =>
              setForm({ ...form, aadhar: Number(e.target.value) })
            }
          />

          <TextField
            label="PAN"
            type="number"
            placeholder="PAN"
            value={form.pan}
            onChange={(e) =>
              setForm({ ...form, pan: Number(e.target.value) })
            }
          />

          <TextField
            label="Registration number"
            type="number"
            placeholder="Registration Number"
            value={form.regNum}
            onChange={(e) =>
              setForm({ ...form, regNum: Number(e.target.value) })
            }
          />

          <TextField
            label="Phone"
            type="number"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: Number(e.target.value) })
            }
          />

          <TextField
            label="Email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <TextField
            label="Coordinates"
            placeholder="Coordinates (example: 72.99,19.07)"
            value={form.coordinates}
            onChange={(e) =>
              setForm({ ...form, coordinates: e.target.value })
            }
            caption="Comma‑separated latitude and longitude"
          />

          <TextField
            label="Property value"
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
            label="Status"
            type="number"
            placeholder="Status (100 or 101)"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: Number(e.target.value) })
            }
            caption="Use 100 or 101"
          />
        </div>

        <div className="form-footer">
          <PrimaryButton type="button" onClick={handleSubmit}>
            Submit
          </PrimaryButton>
          <span className="form-meta">
            Coordinates are sent exactly as provided, split into numeric
            values.
          </span>
        </div>
      </section>
    </Layout>
  );
}

export default AddLand;
