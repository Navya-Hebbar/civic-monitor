import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Feed from "./pages/citizen/Feed";
import Explore from "./pages/citizen/Explore";
import CreateIssue from "./pages/citizen/CreateIssue";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Navbar from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function App() {
  const location = useLocation();
  const { user, loading } = useAuth();

  const authPaths = ["/login", "/signup"];
  const showNavbar = user && !authPaths.includes(location.pathname);

  // ✅ Show loader while checking auth
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {showNavbar && <Navbar />}

      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={user ? <Navigate to="/feed" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/feed" replace /> : <Signup />}
        />

        {/* Normal user */}
        <Route
          path="/feed"
          element={<ProtectedRoute><Feed /></ProtectedRoute>}
        />
        <Route
          path="/explore"
          element={<ProtectedRoute><Explore /></ProtectedRoute>}
        />
        <Route
          path="/create-issue"
          element={<ProtectedRoute><CreateIssue /></ProtectedRoute>}
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}
        />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </div>
  );
}

export default App;
