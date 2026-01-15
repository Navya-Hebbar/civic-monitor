import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        <h1 className="text-2xl font-black tracking-tight text-indigo-600">
          Civic Monitor
        </h1>

        <div className="flex gap-8 items-center">
          <NavLink to="/feed" className="font-semibold text-gray-700 hover:text-indigo-600">
            Feed
          </NavLink>
          <NavLink to="/explore" className="font-semibold text-gray-700 hover:text-indigo-600">
            Explore
          </NavLink>
          <NavLink to="/create-issue" className="font-semibold text-gray-700 hover:text-indigo-600">
            Report
          </NavLink>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
