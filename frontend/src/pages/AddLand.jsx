import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addLand, uploadDocs } from "../api/api";
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
    files: [],
  });

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async () => {
    let folderId = null;
    let uploadedFiles = [];

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
      ...form,
      coordinates: form.coordinates.split(";").map(point => point.split(",").map(Number)),
      driveFolder: folderId,
      documents: uploadedFiles,
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

        <div className="form-grid mb-5">
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
            label="Land area (Acres)"
            type="number"
            placeholder="Land Area (Acres)"
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
            label="Property value (Lakhs)"
            type="number"
            placeholder="Property Value (Lakhs)"
            value={form.propertyValue}
            onChange={(e) =>
              setForm({
                ...form,
                propertyValue: Number(e.target.value),
              })
            }
          />

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
                    setForm({ ...form, status: Number(e.target.value) })
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
                    setForm({ ...form, status: Number(e.target.value) })
                  }
                />
                <span>Not for Sale</span>
              </label>
            </div>
          </div>
        </div>

        <TextField
          label="Coordinates"
          placeholder="Coordinates (example: 21.13016, 81.76137; 21.12860, 81.76071;)"
          value={form.coordinates}
          onChange={(e) =>
            setForm({ ...form, coordinates: e.target.value })
          }
          caption="Semicolon-separated points, each comma-separated longitude and latitude"
        />

        <div className="field mt-4">
          <label className="field-label">Documents</label>
          <input
            type="file"
            multiple
            className="field-input"
            onChange={(e) => setForm({ ...form, files: Array.from(e.target.files) })}
          />
          <p className="field-caption">Upload supporting documents (PDF, images, etc.)</p>
        </div>

        <div className="form-footer">
          <PrimaryButton type="button" onClick={handleSubmit}>
            Submit
          </PrimaryButton>
          <span className="form-meta">
            Coordinates are parsed as semicolon-separated points into an array of [longitude, latitude] pairs.
          </span>
        </div>
      </section>
    </Layout>
  );
}

export default AddLand;
