import { useEffect, useState } from "react";
import { getLands } from "../api/api";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import PrimaryButton from "../components/ui/PrimaryButton";
import MapView from "../components/MapView";
import SearchBar from "../components/SearchBar";

function Dashboard() {

  const [lands, setLands] = useState([]);
  const [targetLocation, setTargetLocation] = useState(null);

  useEffect(() => {
    getLands().then((data) => setLands(data));
  }, []);

  return (
    <Layout>
      <section className="dashboard-layout">

        {/* Map Card */}
        <div className="card map-shell">

          <div className="card-header">
            <div>
              <p className="section-eyebrow">Spatial overview</p>
              <div className="map-header">
                <h2 className="card-title">Land parcel map</h2>
                {/* Search bar */}
                <SearchBar onLocationFound={setTargetLocation} />
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
                          {land.ownerName}
                        </span>
                        <span className="parcel-caption">
                          Area: {land.landArea}
                        </span>
                        <span className="parcel-caption">
                          Status:{" "}
                          {land.status === 10
                            ? "On Sale"
                            : land.status === 11
                            ? "Not for Sale"
                            : land.status}
                        </span>
                      </div>
                      <span className="pill">View details</span>
                    </div>
                  </Link>
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