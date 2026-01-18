import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth(); // ✅ single source of truth
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();        // ✅ let AuthContext handle everything
    navigate("/login");    // ✅ redirect
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">Civic Monitor</div>

        <div className="navbar-links">
          <NavLink to="/feed">Feed</NavLink>
          <NavLink to="/explore">Explore</NavLink>
          <NavLink to="/create-issue">Report</NavLink>

          <div className="profile-wrapper" ref={dropdownRef}>
            <button
              className="profile-btn"
              onClick={() => setOpen((v) => !v)}
            >
              {user.fullName?.[0]?.toUpperCase()}
            </button>

            {open && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {user.fullName?.[0]?.toUpperCase()}
                  </div>
                  <div className="profile-info">
                    <div className="profile-name">{user.fullName}</div>
                    <div className="profile-email">{user.email}</div>
                  </div>
                </div>

                <div className="profile-menu">
                  <button onClick={() => navigate("/profile")}>
                    Profile
                  </button>
                  <button disabled>Account</button>
                  <button disabled>Settings</button>
                </div>

                <div className="profile-divider" />

                <button
                  className="profile-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
