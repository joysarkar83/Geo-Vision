import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getLand } from "../api/api";
import Layout from "../components/Layout";

function LandDetails() {
  const { id } = useParams();

  const [land, setLand] = useState(null);

  useEffect(() => {
    getLand(id).then((data) => setLand(data));
  }, [id]);

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
                Owner and valuation summary for the selected parcel.
              </p>
            </div>
          </div>

          <div>
            <p className="details-label">Owner name</p>
            <p className="details-highlight">{land.ownerName}</p>

            <div className="details-chip-row">
              <span className="pill">Father: {land.fatherName}</span>
              <span className="pill">Area: {land.landArea}</span>
              <span className="pill">Value: {land.propertyValue}</span>
            </div>
          </div>
        </div>

        <div className="card card-muted">
          <div className="card-header">
            <div>
              <p className="section-eyebrow">Registered address</p>
              <h2 className="card-title">Location</h2>
              <p className="card-subtitle">
                Address information as returned from the registry backend.
              </p>
            </div>
          </div>

          <div className="details-metadata">
            <div className="details-item">
              <p className="details-label">Address</p>
              <p className="details-value">{land.address}</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default LandDetails;
