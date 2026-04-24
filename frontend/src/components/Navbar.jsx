import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/api";
import { getUserRole, getUsername, isLoggedIn, logout } from "../utils/auth";

function Navbar() {

  const location = useLocation();
  const navigate = useNavigate();

  const loggedIn = isLoggedIn();
  const username = loggedIn ? getUsername() : null;
  const role = loggedIn ? getUserRole() : null;
  const [fetchedUsername, setFetchedUsername] = useState(null);

  useEffect(() => {
    if (!loggedIn || username) {
      return;
    }

    getCurrentUser()
      .then((data) => {
        if (data?.username) {
          localStorage.setItem("username", data.username);
          setFetchedUsername(data.username);
        }
      })
      .catch(() => {});
  }, [loggedIn, username]);

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/" && location.pathname.startsWith(path));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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

        {loggedIn && (
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
        )}

        {loggedIn && (
          <NavLink
            to="/my-lands"
            className={({ isActive: routeActive }) =>
              `nav-link ${
                routeActive || isActive("/my-lands") ? "nav-link-active" : ""
              }`
            }
          >
            My Lands
          </NavLink>
        )}

        {loggedIn && (role === "admin" || role === "agent") && (
          <NavLink
            to="/admin/verification"
            className={({ isActive: routeActive }) =>
              `nav-link ${
                routeActive || isActive("/admin/verification")
                  ? "nav-link-active"
                  : ""
              }`
            }
          >
            Verify Lands
          </NavLink>
        )}

      </nav>

      <div className="navbar-actions">

        {!loggedIn && (
          <>
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
          </>
        )}

        {loggedIn && (
          <>
            <div className="pill">
              {username || fetchedUsername || "Authenticated user"}
            </div>

            <button
              className="btn-ghost"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}

      </div>

    </header>
  );
}

export default Navbar;
