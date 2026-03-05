import { NavLink, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/" && location.pathname.startsWith(path));

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="navbar-mark">G</div>
        <div className="navbar-title">
          <span className="navbar-name">Geo-Vision</span>
          <span className="navbar-subtitle">Land Parcel Intelligence</span>
        </div>
      </div>

      <nav className="navbar-links">
        <NavLink
          to="/"
          className={({ isActive: routeActive }) =>
            `nav-link ${routeActive || isActive("/") ? "nav-link-active" : ""}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/add-land"
          className={({ isActive: routeActive }) =>
            `nav-link ${
              routeActive || isActive("/add-land") ? "nav-link-active" : ""
            }`
          }
        >
          Add Land
        </NavLink>
      </nav>

      <div className="navbar-actions">
        <NavLink to="/login">
          <button className="btn-ghost" type="button">
            Login
          </button>
        </NavLink>
        <NavLink to="/signup">
          <button className="btn-primary" type="button">
            Signup
          </button>
        </NavLink>
      </div>
    </header>
  );
}

export default Navbar;

