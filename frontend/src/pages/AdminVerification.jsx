import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import PrimaryButton from "../components/ui/PrimaryButton";
import { getPendingLands, rejectLandVerification, verifyLand } from "../api/api";
import { getUserRole } from "../utils/auth";

function AdminVerification() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = getUserRole();

  useEffect(() => {
    getPendingLands()
      .then((data) => {
        setLands(Array.isArray(data) ? data : []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const removeFromQueue = (landId) => {
    setLands((prev) => prev.filter((land) => land._id !== landId));
  };

  const handleVerify = async (landId) => {
    const res = await verifyLand(landId);

    if (res?.error) {
      alert(res.error);
      return;
    }

    removeFromQueue(landId);
  };

  const handleReject = async (landId) => {
    const reason = window.prompt("Reason for rejection:") || "Rejected during verification";
    const res = await rejectLandVerification(landId, reason);

    if (res?.error) {
      alert(res.error);
      return;
    }

    removeFromQueue(landId);
  };

  const canVerify = role === "admin" || role === "agent";

  return (
    <Layout>
      <section className="card">
        <div className="card-header">
          <div>
            <p className="section-eyebrow">Admin queue</p>
            <h1 className="card-title">Land verification</h1>
            <p className="card-subtitle">
              Approve or reject pending land submissions.
            </p>
          </div>
        </div>

        {!canVerify ? (
          <p className="text-sm text-gray-500">
            You do not have permission to verify lands.
          </p>
        ) : loading ? (
          <div className="skeleton" />
        ) : lands.length === 0 ? (
          <p className="text-sm text-gray-500">No pending submissions.</p>
        ) : (
          <ul className="parcel-list">
            {lands.map((land) => (
              <li key={land._id}>
                <div className="parcel-item" style={{ cursor: "default" }}>
                  <div className="parcel-meta">
                    <span className="parcel-owner">
                      {land.ownerId?.username || "Owner"}
                    </span>
                    <span className="parcel-caption">
                      Reg: {land.regNum || "N/A"} • Area: {land.landArea} Acres
                    </span>
                    <span className="parcel-caption">Landmark: {land.landmark || "N/A"}</span>
                  </div>

                  <div className="flex gap-2">
                    <PrimaryButton type="button" onClick={() => handleVerify(land._id)}>
                      Verify
                    </PrimaryButton>
                    <button
                      className="btn-ghost"
                      type="button"
                      onClick={() => handleReject(land._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}

export default AdminVerification;
