/**
 * AddLand.jsx - Updated with AI Features
 * 
 * This is a reference implementation showing how to integrate AI features
 * into the AddLand component. Copy relevant sections to your actual AddLand.jsx
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addLand, uploadDocs, performFullLandVerification } from "../api/api";
import Layout from "../components/Layout";
import TextField from "../components/ui/TextField";
import PrimaryButton from "../components/ui/PrimaryButton";
import DocumentAnalyzer from "../components/DocumentAnalyzer";
import AIValuation from "../components/AIValuation";
import { isLoggedIn } from "../utils/auth";

function AddLandWithAI() {
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

  // Login check
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  }, [navigate]);

  /**
   * Handle extracted document data
   * Auto-fill form fields with extracted information
   */
  const handleDocumentExtracted = (data) => {
    setExtractedData(data);
    
    // Auto-fill form fields
    if (data.ownerName) setForm(prev => ({ ...prev, fatherName: data.ownerName }));
    if (data.address) setForm(prev => ({ ...prev, address: data.address }));
    if (data.landArea) setForm(prev => ({ ...prev, landArea: data.landArea }));
    if (data.regNum) setForm(prev => ({ ...prev, regNum: data.regNum }));
    if (data.pan) setForm(prev => ({ ...prev, pan: data.pan }));
    if (data.dob) setForm(prev => ({ ...prev, dob: data.dob }));
  };

  /**
   * Run AI verification before submission
   */
  const handleVerifyWithAI = async () => {
    setAiLoading(true);
    try {
      // Prepare land data
      const landData = {
        address: form.address,
        landArea: form.landArea,
        regNum: form.regNum,
        pan: form.pan,
        propertyValue: form.propertyValue,
        landmark: form.landmark,
        coordinates: form.coordinates.split(";").map(p => 
          p.trim().split(",").map(v => parseFloat(v.trim()))
        ),
      };

      // Run full verification
      const result = await performFullLandVerification(
        landData,
        extractedData || {}
      );

      if (result.success) {
        setVerificationReport(result.verificationReport);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      alert("AI verification failed. You can still submit manually.");
    } finally {
      setAiLoading(false);
    }
  };

  /**
   * Submit land data to backend
   */
  const handleSubmit = async () => {
    // Validate coordinates
    const coordinates = form.coordinates
      .split(";")
      .map((point) => point.trim())
      .filter((point) => point.length > 0)
      .map((point) => point.split(",").map((value) => Number(value.trim())));

    const hasInvalidCoordinates =
      coordinates.length === 0 ||
      coordinates.some(
        (point) =>
          point.length !== 2 || point.some((value) => Number.isNaN(value))
      );

    if (hasInvalidCoordinates) {
      alert("Enter coordinates as latitude,longitude pairs separated by semicolons.");
      return;
    }

    // If AI verification failed or score too low, get confirmation
    if (verificationReport && verificationReport.overallScore < 60) {
      const confirm = window.confirm(
        `AI verification score is ${verificationReport.overallScore}%. Do you want to continue?`
      );
      if (!confirm) return;
    }

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
      aiVerificationScore: verificationReport?.overallScore || null,
      aiVerificationStatus: verificationReport?.status || null,
    };

    const result = await addLand(payload);
    alert(result.message || result.error || "Unable to submit land details.");

    if (!result.error) {
      navigate("/");
    }
  };

  return (
    <Layout>
      <section>
        <div className="card">
          <div className="card-header">
            <div>
              <p className="section-eyebrow">New record</p>
              <h1 className="card-title">Add land parcel</h1>
              <p className="card-subtitle">
                Capture ownership and valuation details for a new land parcel with AI verification.
              </p>
            </div>
          </div>

          {/* AI Document Analyzer */}
          <DocumentAnalyzer
            onExtract={handleDocumentExtracted}
          />

          {/* Main Form */}
          <div className="form-grid mb-5">
            <TextField
              label="Father name"
              placeholder="Father Name"
              value={form.fatherName}
              onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
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
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <TextField
              label="Land area (Acres)"
              type="number"
              placeholder="Land Area (Acres)"
              value={form.landArea}
              onChange={(e) => setForm({ ...form, landArea: Number(e.target.value) })}
            />

            <TextField
              label="PAN"
              placeholder="PAN"
              value={form.pan}
              onChange={(e) => setForm({ ...form, pan: e.target.value })}
            />

            <TextField
              label="Registration number"
              placeholder="Registration Number"
              value={form.regNum}
              onChange={(e) => setForm({ ...form, regNum: e.target.value })}
            />

            <TextField
              label="Property value (Lakhs)"
              type="number"
              placeholder="Property Value (Lakhs)"
              value={form.propertyValue}
              onChange={(e) => setForm({ ...form, propertyValue: Number(e.target.value) })}
            />

            <TextField
              label="Landmark"
              placeholder="Nearby Landmark"
              value={form.landmark}
              onChange={(e) => setForm({ ...form, landmark: e.target.value })}
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
                    onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                  />
                  <span>On Sale</span>
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="status"
                    value={11}
                    checked={form.status === 11}
                    onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                  />
                  <span>Not for Sale</span>
                </label>
              </div>
            </div>
          </div>

          <TextField
            label="Coordinates"
            placeholder="Coordinates (example: 21.13016,81.76137; 21.12860,81.76071;)"
            value={form.coordinates}
            onChange={(e) => setForm({ ...form, coordinates: e.target.value })}
            caption="Semicolon-separated points, each comma-separated latitude and longitude"
          />

          <div className="field mt-4">
            <label className="field-label">Documents</label>
            <input
              type="file"
              multiple
              className="field-input"
              onChange={(e) => setForm({ ...form, files: Array.from(e.target.files) })}
            />
            <p className="field-caption">
              Upload supporting documents (PDF, images, etc.)
            </p>
          </div>

          {/* AI Verification Report */}
          {verificationReport && <AIValuation verificationReport={verificationReport} />}

          {/* Action Buttons */}
          <div className="form-footer">
            <PrimaryButton 
              type="button" 
              onClick={handleVerifyWithAI}
              disabled={aiLoading || !form.coordinates}
            >
              {aiLoading ? "Verifying..." : "🤖 Verify with AI"}
            </PrimaryButton>

            <PrimaryButton 
              type="button" 
              onClick={handleSubmit}
              disabled={aiLoading}
            >
              ✅ Submit
            </PrimaryButton>

            <span className="form-meta">
              AI verification is optional but recommended. It checks document authenticity and detects fraud.
            </span>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default AddLandWithAI;
