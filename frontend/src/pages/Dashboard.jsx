import { useEffect, useState } from "react";
import { getLands } from "../api/api";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import PrimaryButton from "../components/ui/PrimaryButton";

function Dashboard() {
  const [lands, setLands] = useState([]);

  useEffect(() => {
    getLands().then((data) => setLands(data));
  }, []);

  return (
    <Layout>
      <section className="dashboard-layout">
        <div className="card map-shell">
          <div className="card-header">
            <div>
              <p className="section-eyebrow">Spatial overview</p>
              <h2 className="card-title">Land parcel map</h2>
              <p className="card-subtitle">
                A large, dedicated canvas reserved for the interactive map
                integration.
              </p>
            </div>
          </div>
          <div className="map-placeholder">
            Map integration placeholder &mdash; pan, zoom and parcel overlays
            will appear here.
          </div>
        </div>

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
              <PrimaryButton type="button">Add parcel</PrimaryButton>
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
                        <span className="parcel-owner">{land.ownerName}</span>
                        <span className="parcel-caption">
                          Owner &bull; Tap to view details
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
