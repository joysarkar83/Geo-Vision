import { useEffect, useState } from "react";
import { getLands, getMyRequests, approveRequest as apiApproveRequest } from "../api/api";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import PrimaryButton from "../components/ui/PrimaryButton";
import MapView from "../components/MapView";
import SearchBar from "../components/SearchBar";

function Dashboard() {

  const [lands, setLands] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [targetLocation, setTargetLocation] = useState(null);

  useEffect(() => {

    getLands().then((data) => setLands(Array.isArray(data) ? data : []));

    getMyRequests()
      .then((data) => {
        setIncomingRequests(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setIncomingRequests([]);
      });

  }, []);

  const approveRequest = async (id) => {
    await apiApproveRequest(id);
    setIncomingRequests((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <Layout>
      <section className="dashboard-layout">

        {/* Map Card */}
        <div className="card map-shell">

          <div className="card-header">
            <div className="w-full">
              <p className="section-eyebrow">Spatial overview</p>

              <div className="flex justify-between items-center w-full flex-wrap gap-3">
                <h2 className="card-title">Land parcel map</h2>

                <SearchBar
                  onLocationFound={setTargetLocation}
                  className="bg-yellow-300"
                />
              </div>

              <p className="card-subtitle">
                A large, dedicated canvas reserved for the interactive map
                integration.
              </p>
            </div>
          </div>

          <div className="map-placeholder">
            <MapView targetLocation={targetLocation} />
          </div>

        </div>

        {/* Land List Card */}
        <div className="card">

          <div className="card-header">
            <div>
              <p className="section-eyebrow">Registry</p>
              <h2 className="card-title">Land parcels</h2>

              <p className="card-subtitle">
                Browse recorded parcels and open details for a precise view.
              </p>
            </div>

            <Link to="/add-land">
              <PrimaryButton type="button">
                Add parcel
              </PrimaryButton>
            </Link>
          </div>

          {lands.length === 0 ? (
            <div className="skeleton" />
          ) : (
            <ul className="parcel-list">
              {lands.map((land) => (
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

        {/* Incoming Requests Card */}
        <div className="card">

          <div className="card-header">
            <div>
              <p className="section-eyebrow">Buyer activity</p>
              <h2 className="card-title">Incoming requests</h2>

              <p className="card-subtitle">
                Buyers requesting your contact details for land parcels.
              </p>
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

                    <PrimaryButton
                      type="button"
                      onClick={() => approveRequest(req._id)}
                    >
                      Approve
                    </PrimaryButton>

                  </div>

                </li>

              ))}

            </ul>

          )}

        </div>

      </section>
    </Layout>
  );
}

export default Dashboard;
