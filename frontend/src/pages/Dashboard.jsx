import { useEffect, useState } from "react";
import { getLands } from "../api/api";
import { Link } from "react-router-dom";

function Dashboard() {

  const [lands, setLands] = useState([]);

  useEffect(() => {
    getLands().then(data => setLands(data));
  }, []);

  return (
    <div>

      <h1>GeoVision Dashboard</h1>

      <Link to="/login">Login</Link>
      <br />
      <Link to="/signup">Signup</Link>
      <br />
      <Link to="/add-land">Add Land</Link>

      <h2>Land Parcels</h2>

      {lands.map(land => (
        <div key={land._id}>
          <p>Owner: {land.ownerName}</p>
          <Link to={`/land/${land._id}`}>View Details</Link>
        </div>
      ))}

    </div>
  );
}

export default Dashboard;