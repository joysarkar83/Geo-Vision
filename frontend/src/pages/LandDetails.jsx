import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { checkRequestStatus, getLand, sendContactRequest } from "../api/api";
import Layout from "../components/Layout";
import PrimaryButton from "../components/ui/PrimaryButton";
import { getUserId, isLoggedIn } from "../utils/auth";

function LandDetails() {
  const { id } = useParams();

  const [land, setLand] = useState(null);
  const [contact, setContact] = useState(null);
  const [requested, setRequested] = useState(false);
  const [loadError, setLoadError] = useState("");
  const currentUserId = getUserId();
  const isOwner = land?.ownerId?._id === currentUserId;
  const loggedIn = isLoggedIn();

  useEffect(() => {
    getLand(id)
      .then((data) => {
        if (data?._id) {
          setLand(data);
          setLoadError("");
          return;
        }

        setLand(null);
        setLoadError(data?.message || "Unable to load land details.");
      })
      .catch(() => {
        setLand(null);
        setLoadError("Unable to load land details.");
      });

    if (loggedIn) {
      checkRequestStatus(id).then((data) => {
        if (data.approved) {
          setContact({
            phone: data.phone,
            email: data.email,
          });
        }
      });
    }
  }, [id, loggedIn]);

  const sendRequest = async () => {
    const data = await sendContactRequest(id);
    alert(data.message);
    setRequested(true);
  };

  if (!land) {
    return (
      <Layout>
        <div className="card">
          <div className="card-header">
            <div>
              <p className="section-eyebrow">
                {loadError ? "Record unavailable" : "Loading record"}
              </p>
              <h1 className="card-title">
                {loadError || "Fetching land details..."}
              </h1>
            </div>
          </div>
          {loadError ? (
            <p className="text-sm text-gray-500">
              Check the selected land ID or backend response and try again.
            </p>
          ) : (
            <div className="skeleton" />
          )}
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
            <p className="details-highlight">{land.ownerId?.username}</p>

            <div className="details-chip-row">
              <span className="pill">Father: {land.fatherName}</span>
              <span className="pill">Area: {land.landArea} Acres</span>

              {loggedIn && (
                <span className="pill">
                  Value: {land.propertyValue} Lakhs
                </span>
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
              <p className="details-value">
                {land.sellingStatus === 10 ? "On Sale" : "Not For Sale"}
              </p>
            </div>
          </div>
        </div>

        <div className="card card-muted flex flex-col gap-3">
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

            {!loggedIn && (
              <p className="text-sm text-gray-500">
                Login to request seller contact details.
              </p>
            )}

            {loggedIn && contact && (
              <>
                <div className="details-item">
                  <p className="details-label">Phone</p>
                  <p className="details-value">{contact.phone}</p>
                </div>

                <div className="details-item">
                  <p className="details-label">Email</p>
                  <p className="details-value">{contact.email}</p>
                </div>
              </>
            )}
          </div>
          {loggedIn && !contact && !isOwner && (
            <PrimaryButton type="button" onClick={sendRequest} className="w-max text-center">
              {requested ? "Request Sent" : "Request Contact"}
            </PrimaryButton>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default LandDetails;
