import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getLand } from "../api/api";

function LandDetails() {

  const { id } = useParams();

  const [land, setLand] = useState(null);

  useEffect(() => {
    getLand(id).then(data => setLand(data));
  }, []);

  if (!land) return <p>Loading...</p>;

  return (
    <div>

      <h1>Land Details</h1>

      <p>Owner: {land.ownerName}</p>
      <p>Father: {land.fatherName}</p>
      <p>Address: {land.address}</p>
      <p>Area: {land.landArea}</p>
      <p>Value: {land.propertyValue}</p>

    </div>
  );
}

export default LandDetails;