import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import PrimaryButton from "../components/ui/PrimaryButton";
import { deleteLand, getMyLands, updateLand } from "../api/api";

function MyLands() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyLands()
      .then((data) => {
        setLands(Array.isArray(data) ? data : []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDelete = async (landId) => {
    const confirmed = window.confirm("Delete this land parcel?");
    if (!confirmed) return;

    const res = await deleteLand(landId);
    if (res?.error) {
      alert(res.error);
      return;
    }

    setLands((prev) => prev.filter((land) => land._id !== landId));
  };

  const toggleSellingStatus = async (land) => {
    const nextStatus = land.sellingStatus === 10 ? 11 : 10;

    const res = await updateLand(land._id, { sellingStatus: nextStatus });

    if (res?.error) {
      alert(res.error);
      return;
    }

    setLands((prev) =>
      prev.map((entry) =>
        entry._id === land._id
          ? { ...entry, sellingStatus: nextStatus }
          : entry
      )
    );
  };

  const verificationText = (status) => {
    if (status === 1) return "Verified";
    if (status === 2) return "Rejected";
    return "Pending";
  };

  return (
    <Layout>
      <section className="card">
        <div className="card-header">
          <div>
            <p className="section-eyebrow">Owner panel</p>
            <h1 className="card-title">My lands</h1>
            <p className="card-subtitle">
              Review submitted parcels, verification state, and listing status.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="skeleton" />
        ) : lands.length === 0 ? (
          <p className="text-sm text-gray-500">You have not submitted any parcels yet.</p>
        ) : (
          <ul className="parcel-list">
            {lands.map((land) => (
              <li key={land._id}>
                <div className="parcel-item" style={{ cursor: "default" }}>
                  <div className="parcel-meta">
                    <span className="parcel-owner">{land.landmark || "Unnamed parcel"}</span>
                    <span className="parcel-caption">
                      Verification: {verificationText(land.verificationStatus)}
                      {land.verificationNote ? ` • ${land.verificationNote}` : ""}
                    </span>
                    <span className="parcel-caption">
                      Selling: {land.sellingStatus === 10 ? "On Sale" : "Not for Sale"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <PrimaryButton
                      type="button"
                      onClick={() => toggleSellingStatus(land)}
                    >
                      {land.sellingStatus === 10 ? "Mark Not for Sale" : "Mark On Sale"}
                    </PrimaryButton>

                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => handleDelete(land._id)}
                    >
                      Delete
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

export default MyLands;
