import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  addLand,
  uploadDocs,
  performFullLandVerification,
} from "../api/api";

import Layout from "../components/Layout";
import TextField from "../components/ui/TextField";
import PrimaryButton from "../components/ui/PrimaryButton";
import DocumentAnalyzer from "../components/DocumentAnalyzer";
import AIValuation from "../components/AIValuation";
import MapDraw from "../components/MapDraw";

import { isLoggedIn } from "../utils/auth";

function AddLand() {
  const navigate = useNavigate();

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

  const [extractedData, setExtractedData] = useState(null);
  const [verificationReport, setVerificationReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  }, [navigate]);

  // Auto-fill form from extracted document data
  const handleDocumentExtracted = (data) => {
    setExtractedData(data);

    if (!data) return;

    setForm((prev) => ({
      ...prev,
      fatherName: data.ownerName || prev.fatherName,
      address: data.address || prev.address,
      landArea: data.landArea || prev.landArea,
      regNum: data.regNum || prev.regNum,
      pan: data.pan || prev.pan,
      dob: data.dob || prev.dob,
    }));
  };

  // AI verification
  const handleVerifyWithAI = async () => {
    try {
      setAiLoading(true);

      if (!form.coordinates.trim()) {
        alert("Please enter coordinates first.");
        return;
      }

      const coordinates = form.coordinates
        .split(";")
        .map((point) => point.trim())
        .filter((point) => point.length > 0)
        .map((point) =>
          point.split(",").map((value) => parseFloat(value.trim()))
        );

      const hasInvalidCoordinates =
        coordinates.length === 0 ||
        coordinates.some(
          (point) =>
            point.length !== 2 ||
            point.some((value) => Number.isNaN(value))
        );

      if (hasInvalidCoordinates) {
        alert(
          "Enter coordinates as latitude,longitude pairs separated by semicolons."
        );
        return;
      }

      const landData = {
        address: form.address,
        landArea: form.landArea,
        regNum: form.regNum,
        pan: form.pan,
        propertyValue: form.propertyValue,
        landmark: form.landmark,
        coordinates,
      };

      const result = await performFullLandVerification(
        landData,
        extractedData || {}
      );

      if (result.success) {
        setVerificationReport(result.verificationReport);

        alert(
          `✅ Verification Complete!\nScore: ${result.verificationReport.overallScore}`
        );
      } else {
        alert(result.error || "Verification failed");
      }
    } catch (error) {
      console.error(error);
      alert("AI verification failed.");
    } finally {
      setAiLoading(false);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    const coordinates = form.coordinates
      .split(";")
      .map((point) => point.trim())
      .filter((point) => point.length > 0)
      .map((point) =>
        point.split(",").map((value) => Number(value.trim()))
      );

    const hasInvalidCoordinates =
      coordinates.length === 0 ||
      coordinates.some(
        (point) =>
          point.length !== 2 ||
          point.some((value) => Number.isNaN(value))
      );

    if (hasInvalidCoordinates) {
      alert(
        "Enter coordinates as latitude,longitude pairs separated by semicolons."
      );
      return;
    }

    let folderId = null;
    let uploadedFiles = [];

    // Upload files
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
      aiVerificationScore:
        verificationReport?.overallScore || null,
      aiVerificationStatus:
        verificationReport?.status || null,
    };

    const result = await addLand(payload);

    alert(
      result.message ||
      result.error ||
      "Unable to submit land details."
    );

    if (!result.error) {
      navigate("/");
    }
  };

  return (
    <Layout>
      <section className="card">
        <div className="card-header">
          <div>
            <p className="section-eyebrow">
              New Record
            </p>

            <h1 className="card-title">
              Add Land Parcel
            </h1>

            <p className="card-subtitle">
              Capture ownership and valuation
              details for a new land parcel.
            </p>
          </div>
        </div>

        {/* Document Analyzer */}
        <DocumentAnalyzer
          onExtract={handleDocumentExtracted}
        />

        {/* Form */}
        <div className="form-grid mb-5">
          <TextField
            label="Father Name"
            placeholder="Father Name"
            value={form.fatherName}
            onChange={(e) =>
              setForm({
                ...form,
                fatherName: e.target.value,
              })
            }
          />

          <div className="field">
            <label className="field-label">
              Date of Birth
            </label>

            <input
              className="field-input"
              type="date"
              value={form.dob}
              onChange={(e) =>
                setForm({
                  ...form,
                  dob: e.target.value,
                })
              }
            />
          </div>

          <TextField
            label="Address"
            placeholder="Address"
            value={form.address}
            onChange={(e) =>
              setForm({
                ...form,
                address: e.target.value,
              })
            }
          />

          <TextField
            label="Land Area (Acres)"
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
              setForm({
                ...form,
                pan: e.target.value,
              })
            }
          />

          <TextField
            label="Registration Number"
            placeholder="Registration Number"
            value={form.regNum}
            onChange={(e) =>
              setForm({
                ...form,
                regNum: e.target.value,
              })
            }
          />

          <TextField
            label="Property Value (Lakhs)"
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

          {/* Status */}
          <div className="field">
            <label className="field-label">
              Status
            </label>

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

        {/* Coordinates */}
        <MapDraw
          value={form.coordinates}
          onChange={(val) =>
            setForm({
              ...form,
              coordinates: val,
            })
          }
        />

        {/* Documents */}
        <div className="field mt-4">
          <label className="field-label">
            Documents
          </label>

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
            Upload supporting documents
            (PDF/images)
          </p>
        </div>

        {/* AI Report */}
        {verificationReport && (
          <AIValuation
            verificationReport={verificationReport}
          />
        )}

        {/* Buttons */}
        <div
          className="form-footer"
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <button
            type="button"
            onClick={handleVerifyWithAI}
            disabled={aiLoading}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              background: aiLoading
                ? "#999"
                : "#8b5cf6",
              color: "#fff",
              cursor: aiLoading
                ? "not-allowed"
                : "pointer",
              fontWeight: 600,
            }}
          >
            {aiLoading
              ? "⏳ Verifying..."
              : "🤖 Verify with AI"}
          </button>

          <PrimaryButton
            type="button"
            onClick={handleSubmit}
          >
            Submit
          </PrimaryButton>
        </div>
      </section>
    </Layout>
  );
}

export default AddLand;