import { useState } from "react";
import useAI from "../hooks/useAI";
import PrimaryButton from "./ui/PrimaryButton";
import "../styles/DocumentAnalyzer.css";

function DocumentAnalyzer({ onExtract, onVerify }) {
  const { extractDocument, verifyDocument, loading, error } = useAI();
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [verification, setVerification] = useState(null);
  const [docType, setDocType] = useState("land_deed");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setExtractedData(null);
    setVerification(null);
  };

  const handleExtract = async () => {
    if (!selectedFile) {
      alert("Please select a document");
      return;
    }

    try {
      const result = await extractDocument(selectedFile);
      setExtractedData(result.extracted);
      onExtract?.(result.extracted);
    } catch (err) {
      console.error("Extraction failed:", err);
    }
  };

  const handleVerify = async () => {
    if (!selectedFile) {
      alert("Please select a document");
      return;
    }

    try {
      const result = await verifyDocument(selectedFile, docType);
      setVerification(result.verification);
      onVerify?.(result.verification);
    } catch (err) {
      console.error("Verification failed:", err);
    }
  };

  return (
    <div className="document-analyzer">
      <div className="card">
        <h3>📄 AI Document Analyzer</h3>

        {/* File Upload */}
        <div className="form-group">
          <label>Upload Document (Image/PDF)</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            disabled={loading}
            className="file-input"
          />
          {selectedFile && (
            <p className="file-name">📎 {selectedFile.name}</p>
          )}
        </div>

        {/* Document Type Selector */}
        <div className="form-group">
          <label>Document Type</label>
          <select value={docType} onChange={(e) => setDocType(e.target.value)} disabled={loading}>
            <option value="land_deed">Land Deed</option>
            <option value="property_title">Property Title</option>
            <option value="survey_report">Survey Report</option>
            <option value="revenue_document">Revenue Document</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="button-group">
          <PrimaryButton onClick={handleExtract} disabled={loading || !selectedFile}>
            {loading ? "Processing..." : "🔍 Extract Data"}
          </PrimaryButton>
          <PrimaryButton onClick={handleVerify} disabled={loading || !selectedFile} variant="secondary">
            {loading ? "Verifying..." : "✅ Verify Authenticity"}
          </PrimaryButton>
        </div>

        {/* Error Display */}
        {error && <div className="error-message">❌ {error}</div>}

        {/* Extracted Data Display */}
        {extractedData && (
          <div className="result-section">
            <h4>📋 Extracted Information</h4>
            <div className="extracted-data">
              {extractedData.ownerName && (
                <div className="data-row">
                  <span className="label">Owner:</span>
                  <span className="value">{extractedData.ownerName}</span>
                </div>
              )}
              {extractedData.landArea && (
                <div className="data-row">
                  <span className="label">Land Area:</span>
                  <span className="value">{extractedData.landArea}</span>
                </div>
              )}
              {extractedData.address && (
                <div className="data-row">
                  <span className="label">Address:</span>
                  <span className="value">{extractedData.address}</span>
                </div>
              )}
              {extractedData.regNum && (
                <div className="data-row">
                  <span className="label">Registration #:</span>
                  <span className="value">{extractedData.regNum}</span>
                </div>
              )}
              {extractedData.dob && (
                <div className="data-row">
                  <span className="label">DOB:</span>
                  <span className="value">{extractedData.dob}</span>
                </div>
              )}
              {extractedData.confidence && (
                <div className="data-row confidence">
                  <span className="label">Confidence:</span>
                  <span className="value">{extractedData.confidence}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verification Result Display */}
        {verification && (
          <div className="result-section">
            <h4>🔐 Document Verification</h4>
            <div className="verification-result">
              <div className="verification-score">
                <span className="score-label">Authenticity Score:</span>
                <span
                  className={`score ${
                    verification.authenticityScore >= 80
                      ? "high"
                      : verification.authenticityScore >= 60
                      ? "medium"
                      : "low"
                  }`}
                >
                  {verification.authenticityScore}%
                </span>
              </div>
              <div className="data-row">
                <span className="label">Status:</span>
                <span className={`badge ${verification.recommendation.toLowerCase()}`}>
                  {verification.recommendation}
                </span>
              </div>
              {verification.flags && verification.flags.length > 0 && (
                <div className="flags-section">
                  <strong>⚠️ Flags:</strong>
                  <ul>
                    {verification.flags.map((flag, i) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentAnalyzer;
