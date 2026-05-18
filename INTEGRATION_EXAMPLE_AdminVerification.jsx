/**
 * AdminVerification.jsx - Updated with AI Features (Reference)
 * 
 * This shows how to integrate AI verification reports in the admin panel
 */

import { useEffect, useState } from "react";
import { getPendingLands, verifyLand, rejectLandVerification } from "../api/api";
import Layout from "../components/Layout";
import AIValuation from "../components/AIValuation";
import { isLoggedIn } from "../utils/auth";

function AdminVerificationWithAI() {
  const [lands, setLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }

    loadPendingLands();
  }, []);

  const loadPendingLands = async () => {
    try {
      const data = await getPendingLands();
      setLands(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load lands:", error);
    }
  };

  const handleApprove = async (landId) => {
    if (window.confirm("Approve this land listing?")) {
      setLoading(true);
      try {
        await verifyLand(landId);
        setLands(lands.filter(l => l._id !== landId));
        setSelectedLand(null);
        alert("Land approved successfully!");
      } catch (error) {
        alert("Approval failed: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReject = async (landId) => {
    const reason = rejectionReason || window.prompt("Rejection reason:");
    if (reason) {
      setLoading(true);
      try {
        await rejectLandVerification(landId, reason);
        setLands(lands.filter(l => l._id !== landId));
        setSelectedLand(null);
        setRejectionReason("");
        alert("Land rejected successfully!");
      } catch (error) {
        alert("Rejection failed: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Layout>
      <section className="card">
        <div className="card-header">
          <div>
            <p className="section-eyebrow">Admin Panel</p>
            <h1 className="card-title">Verify Land Listings</h1>
            <p className="card-subtitle">
              Review and verify pending land submissions with AI assistance
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
          {/* Pending Lands List */}
          <div style={{
            borderRight: "1px solid #e5e7eb",
            paddingRight: "20px",
            maxHeight: "600px",
            overflowY: "auto"
          }}>
            <h3>Pending ({lands.length})</h3>
            {lands.length === 0 ? (
              <p style={{ color: "#9ca3af" }}>No pending lands</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {lands.map((land) => (
                  <button
                    key={land._id}
                    onClick={() => setSelectedLand(land)}
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      border: selectedLand?._id === land._id ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                      borderRadius: "6px",
                      background: selectedLand?._id === land._id ? "#eff6ff" : "white",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{land.address}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {land.landArea} acres • ₹{land.propertyValue}L
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detailed View with AI Report */}
          <div>
            {selectedLand ? (
              <div>
                <h3>{selectedLand.address}</h3>

                {/* Land Details */}
                <div style={{
                  background: "#f9fafb",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <span style={{ color: "#6b7280", fontSize: "12px" }}>Area</span>
                      <div style={{ fontWeight: 600 }}>{selectedLand.landArea} acres</div>
                    </div>
                    <div>
                      <span style={{ color: "#6b7280", fontSize: "12px" }}>Property Value</span>
                      <div style={{ fontWeight: 600 }}>₹{selectedLand.propertyValue}L</div>
                    </div>
                    <div>
                      <span style={{ color: "#6b7280", fontSize: "12px" }}>Registration #</span>
                      <div style={{ fontWeight: 600 }}>{selectedLand.regNum}</div>
                    </div>
                    <div>
                      <span style={{ color: "#6b7280", fontSize: "12px" }}>PAN</span>
                      <div style={{ fontWeight: 600 }}>{selectedLand.pan}</div>
                    </div>
                  </div>
                </div>

                {/* AI Verification Report */}
                {selectedLand.aiVerificationScore && (
                  <AIValuation 
                    verificationReport={{
                      overallScore: selectedLand.aiVerificationScore,
                      status: selectedLand.aiVerificationStatus,
                      checks: selectedLand.aiVerificationDetails || {}
                    }}
                  />
                )}

                {/* Admin Actions */}
                <div style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "16px",
                  paddingTop: "16px",
                  borderTop: "1px solid #e5e7eb",
                }}>
                  <button
                    onClick={() => handleApprove(selectedLand._id)}
                    disabled={loading}
                    style={{
                      padding: "10px 16px",
                      background: "#22c55e",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1,
                      fontWeight: 600,
                    }}
                  >
                    ✅ Approve
                  </button>

                  <button
                    onClick={() => handleReject(selectedLand._id)}
                    disabled={loading}
                    style={{
                      padding: "10px 16px",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1,
                      fontWeight: 600,
                    }}
                  >
                    ❌ Reject
                  </button>

                  {rejectionReason && (
                    <div style={{ color: "#6b7280", marginLeft: "auto", paddingTop: "10px" }}>
                      Reason: {rejectionReason}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ color: "#9ca3af", textAlign: "center", marginTop: "40px" }}>
                Select a land to review
              </p>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default AdminVerificationWithAI;
