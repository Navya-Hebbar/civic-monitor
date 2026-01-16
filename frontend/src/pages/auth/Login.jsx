import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const { setUser, user: currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasRedirected = useRef(false);

  // 🔒 AUTH REDIRECT LOGIC (UNCHANGED)
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== "/login") return;
    if (hasRedirected.current) return;
    if (authLoading || loading) return;

    if (currentUser?.id) {
      hasRedirected.current = true;
      navigate(
        currentUser.role === "ADMIN" ? "/admin" : "/feed",
        { replace: true }
      );
    }
  }, [currentUser?.id, authLoading, loading, navigate]);

  // 🔒 LOGIN LOGIC (UNCHANGED)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", credentials);
      const data = res.data;

      const token =
        data?.token ||
        data?.accessToken ||
        data?.jwt ||
        data?.data?.token;

      if (token) localStorage.setItem("token", token);

      let userData = null;
      try {
        const userRes = await api.get("/users/me");
        userData = userRes.data;
      } catch {
        userData = {
          id: data?.id || Date.now(),
          email: credentials.email,
          role: data?.role || "CITIZEN",
          fullName: data?.fullName || credentials.email.split("@")[0],
        };
      }

      localStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);

      hasRedirected.current = true;
      navigate(
        userData.role === "ADMIN" ? "/admin" : "/feed",
        { replace: true }
      );
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Invalid email or password"
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* LEFT – SVG CIVIC ANIMATION */}
        <div className="hidden md:flex items-center justify-center bg-indigo-50 p-10">
          <svg
            width="320"
            height="260"
            viewBox="0 0 320 260"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect y="200" width="320" height="60" fill="#E0E7FF" />

            {/* Buildings */}
            <rect x="30" y="110" width="40" height="90" rx="4" fill="#6366F1">
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 4"
                to="0 -4"
                dur="4s"
                repeatCount="indefinite"
              />
            </rect>

            <rect x="90" y="80" width="50" height="120" rx="4" fill="#4F46E5">
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 -3"
                to="0 3"
                dur="5s"
                repeatCount="indefinite"
              />
            </rect>

            <rect x="160" y="95" width="45" height="105" rx="4" fill="#6366F1">
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 5"
                to="0 -5"
                dur="4.5s"
                repeatCount="indefinite"
              />
            </rect>

            <rect x="220" y="120" width="35" height="80" rx="4" fill="#4F46E5">
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 -2"
                to="0 2"
                dur="3.5s"
                repeatCount="indefinite"
              />
            </rect>

            {/* Sun */}
            <circle cx="250" cy="40" r="18" fill="#FBBF24">
              <animate
                attributeName="opacity"
                from="0.6"
                to="1"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>

            <text
              x="160"
              y="240"
              textAnchor="middle"
              fill="#4F46E5"
              fontSize="14"
              fontWeight="600"
            >
              Building Better Cities Together
            </text>
          </svg>
        </div>

        {/* RIGHT – LOGIN FORM */}
        <div className="p-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            Civic Monitor
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Report, track & resolve civic issues
          </p>

          {error && (
            <div className="mb-4 p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-500 text-center">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Sign up
            </a>
          </p>

          <p className="mt-4 text-xs text-gray-400 text-center">
            Secure cloud authentication • Civic Monitor
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
