import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Signup = () => {
  const { user: currentUser } = useAuth(); // ✅ login REMOVED
  const [geo, setGeo] = useState({ cities: [], zones: [], localities: [] });
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    cityId: "",
    zoneId: "",
    localityId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/feed", { replace: true });
      }
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const res = await api.get("/geo/cities");
        setGeo((g) => ({ ...g, cities: res.data }));
      } catch {
        setGeo({
          cities: [
            { id: "1", name: "Bangalore" },
            { id: "2", name: "Mumbai" },
            { id: "3", name: "Delhi" },
          ],
          zones: [],
          localities: [],
        });
      }
    };
    loadGeoData();
  }, []);

  const handleCityChange = async (cityId) => {
    setFormData({ ...formData, cityId, zoneId: "", localityId: "" });
    try {
      const { data } = await api.get(`/geo/zones?cityId=${cityId}`);
      setGeo((g) => ({ ...g, zones: data, localities: [] }));
    } catch {
      setGeo((g) => ({
        ...g,
        zones: [
          { id: `${cityId}-zone-1`, name: "Zone 1" },
          { id: `${cityId}-zone-2`, name: "Zone 2" },
          { id: `${cityId}-zone-3`, name: "Zone 3" },
        ],
        localities: [],
      }));
    }
  };

  const handleZoneChange = async (zoneId) => {
    setFormData({ ...formData, zoneId, localityId: "" });
    try {
      const { data } = await api.get(`/geo/localities?zoneId=${zoneId}`);
      setGeo((g) => ({ ...g, localities: data }));
    } catch {
      setGeo((g) => ({
        ...g,
        localities: [
          { id: `${zoneId}-loc-1`, name: "Locality 1" },
          { id: `${zoneId}-loc-2`, name: "Locality 2" },
          { id: `${zoneId}-loc-3`, name: "Locality 3" },
        ],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/signup", formData);
      console.log("✅ Signup successful");

      // Store token if backend sends it
      const token =
        res.data?.token ||
        res.data?.accessToken ||
        res.data?.jwt ||
        res.data?.data?.token;

      if (token) {
        localStorage.setItem("token", token);
      }

      // ✅ DO NOT call login()
      navigate("/feed", { replace: true });
    } catch (err) {
      console.error("Signup failed:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Signup failed. Please try again.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏛️</div>
          <h2 className="text-3xl font-bold text-gray-800">Civic Monitor</h2>
          <p className="text-gray-500 text-sm">
            Create your citizen account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            required
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className="w-full border rounded-lg px-4 py-2"
          />

          <input
            type="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full border rounded-lg px-4 py-2"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full border rounded-lg px-4 py-2"
          />

          <select
            required
            value={formData.cityId}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="">Select City</option>
            {geo.cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            required
            disabled={!formData.cityId}
            value={formData.zoneId}
            onChange={(e) => handleZoneChange(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="">Select Zone</option>
            {geo.zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>

          <select
            required
            disabled={!formData.zoneId}
            value={formData.localityId}
            onChange={(e) =>
              setFormData({ ...formData, localityId: e.target.value })
            }
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="">Select Locality</option>
            {geo.localities.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 font-semibold">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
