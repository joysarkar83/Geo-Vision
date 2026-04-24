import { useEffect, useMemo, useState } from "react";
import {
  getLands,
  getMyRequests,
  approveRequest as apiApproveRequest,
  rejectRequest as apiRejectRequest,
} from "../api/api";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import PrimaryButton from "../components/ui/PrimaryButton";
import MapView from "../components/MapView";
import SearchBar from "../components/SearchBar";
import { isLoggedIn } from "../utils/auth";

function Dashboard() {

  const [lands, setLands] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [targetLocation, setTargetLocation] = useState(null);
  const [ownerSearchQuery, setOwnerSearchQuery] = useState("");
  const [ownerSearchTerm, setOwnerSearchTerm] = useState("");

  useEffect(() => {

    getLands().then((data) => setLands(Array.isArray(data) ? data : []));

    if (isLoggedIn()) {
      getMyRequests()
        .then((data) => {
          setIncomingRequests(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          setIncomingRequests([]);
        });
    }

  }, []);

  const approveRequest = async (id) => {
    await apiApproveRequest(id);
    setIncomingRequests((prev) => prev.filter((r) => r._id !== id));
  };

  const rejectRequest = async (id) => {
    const reason = window.prompt("Optional rejection reason:") || "";
    await apiRejectRequest(id, reason);
    setIncomingRequests((prev) => prev.filter((r) => r._id !== id));
  };

  const filteredLands = useMemo(() => {
    const normalizedSearch = ownerSearchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return lands;
    }

    return lands.filter((land) =>
      (land.ownerId?.username || "").toLowerCase().includes(normalizedSearch)
    );
  }, [lands, ownerSearchTerm]);

  const handleOwnerSearch = () => {
    setOwnerSearchTerm(ownerSearchQuery);
  };

  return (
    <Layout>
      <section className="dashboard-layout">

        {/* Map Card */}
        <div className="card map-shell">

          <div className="card-header">
            <div className="w-full">
              <p className="section-eyebrow">Spatial overview</p>

              <div className="flex justify-between w-full flex-wrap gap-3 items-center">
                <h2 className="card-title">Land parcel map</h2>

                <SearchBar
                  onLocationFound={setTargetLocation}
                  className="bg-yellow-300"
                />
              </div>
            </div>
          </div>

          <div className="map-placeholder">
            <MapView targetLocation={targetLocation} />
          </div>

        </div>

        <div className="flex flex-col gap-4">
          {/* Incoming Requests Card */}
          <div className="card">

            <div className="card-header">
              <div>
                <p className="section-eyebrow">Buyer activity</p>
                <h2 className="card-title">Incoming requests</h2>
              </div>
            </div>

            {incomingRequests.length === 0 ? (

              <p className="text-sm text-gray-500">
                No incoming requests.
              </p>

            ) : (

              <ul className="parcel-list">

                {incomingRequests.map((req) => (

                  <li key={req._id}>

                    <div className="parcel-item">

                      <div className="parcel-meta">

                        <span className="parcel-owner">
                          Buyer: {req.buyerId?.username}
                        </span>

                        <span className="parcel-caption">
                          Buyer requesting contact access
                        </span>

                      </div>

                      <div className="flex gap-2">
                        <PrimaryButton
                          type="button"
                          onClick={() => approveRequest(req._id)}
                        >
                          Approve
                        </PrimaryButton>

                        <button
                          className="btn-ghost"
                          type="button"
                          onClick={() => rejectRequest(req._id)}
                        >
                          Reject
                        </button>
                      </div>

                    </div>

                  </li>

                ))}

              </ul>

            )}

          </div>



          {/* Land List Card */}
          <div className="card">

            <div className="card-header">
              <div>
                <p className="section-eyebrow">Registry</p>
                <h2 className="card-title">Land parcels</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="search-bar mt-2">
                    <input
                      className="search-input"
                      type="text"
                      placeholder="Search owner name..."
                      value={ownerSearchQuery}
                      onChange={(e) => setOwnerSearchQuery(e.target.value)}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          handleOwnerSearch();
                        }
                      }}
                    />
                    <button
                      className="search-button text-sm"
                      type="button"
                      onClick={handleOwnerSearch}
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {lands.length === 0 ? (
              <div className="skeleton" />
            ) : filteredLands.length === 0 ? (
              <p className="text-sm text-gray-500">
                No land parcels match that owner name.
              </p>
            ) : (
              <ul className="parcel-list">
                {filteredLands.map((land) => (
                  <li key={land._id}>
                    <Link to={`/land/${land._id}`}>
                      <div className="parcel-item">

                        <div className="parcel-meta">
                          <span className="parcel-owner">
                            {land.ownerId?.username || "Owner"}
                          </span>

                          <span className="parcel-caption">
                            Owner • Tap to view details
                          </span>
                        </div>

                        <span className="pill whitespace-nowrap">
                          View details
                        </span>

                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

          </div>
        </div>
      </section>
    </Layout>
  );
}

export default Dashboard;
