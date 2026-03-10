import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getLand } from "../api/api";
import Layout from "../components/Layout";
import { isLoggedIn } from "../utils/auth";

function LandDetails() {
  const { id } = useParams();

  const [land, setLand] = useState(null);

  useEffect(() => {
    getLand(id).then((data) => setLand(data));
  }, [id]);

  const loggedIn = isLoggedIn();

  if (!land) {
    return (
      <Layout>
        <div className="card">
          <div className="card-header">
            <div>
              <p className="section-eyebrow">Loading record</p>
              <h1 className="card-title">Fetching land details…</h1>
            </div>
          </div>
          <div className="skeleton" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="details-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <p className="section-eyebrow">Land record</p>
              <h1 className="card-title">Land details</h1>
              <p className="card-subtitle">
                Owner and parcel summary for the selected record.
              </p>
            </div>
          </div>

          <div>
            <p className="details-label">Owner name</p>
            <p className="details-highlight">{land.ownerName}</p>

            <div className="details-chip-row">
              <span className="pill">Father: {land.fatherName}</span>
              <span className="pill">Area: {land.landArea} Acres</span>
              {loggedIn && (
                <span className="pill">Value: {land.propertyValue} Lakhs</span>
              )}
            </div>
          </div>

          <div className="details-metadata" style={{ marginTop: 16 }}>
            <div className="details-item">
              <p className="details-label">Landmark</p>
              <p className="details-value">{land.landmark}</p>
            </div>
            <div className="details-item">
              <p className="details-label">Status</p>
              <p className="details-value">{
              land.sellingStatus === 10 ? "On Sale":"Not For Sale"
              }</p>
            </div>
          </div>
        </div>

        <div className="card card-muted">
          <div className="card-header">
            <div>
              <p className="section-eyebrow">Registered address</p>
              <h2 className="card-title">Location & contact</h2>
              <p className="card-subtitle">
                Address information from the registry backend.
              </p>
            </div>
          </div>

          <div className="details-metadata">
            <div className="details-item">
              <p className="details-label">Address</p>
              <p className="details-value">{land.address}</p>
            </div>

            {loggedIn && (
              <>
                <div className="details-item">
                  <p className="details-label">Phone</p>
                  <p className="details-value">{land.phone}</p>
                </div>
                <div className="details-item">
                  <p className="details-label">Email</p>
                  <p className="details-value">{land.email}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default LandDetails;

