import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import authImage from "../../assets/authimage.png";
import "./Auth.css";

const Signup = () => {
  const navigate = useNavigate();

  const [geo, setGeo] = useState({ cities: [], zones: [], localities: [] });
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    cityId: "",
    zoneId: "",
    localityId: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/geo/cities").then((res) =>
      setGeo((g) => ({ ...g, cities: res.data }))
    );
  }, []);

  const handleCity = async (id) => {
    setForm({ ...form, cityId: id, zoneId: "", localityId: "" });
    const { data } = await api.get(`/geo/zones?cityId=${id}`);
    setGeo((g) => ({ ...g, zones: data, localities: [] }));
  };

  const handleZone = async (id) => {
    setForm({ ...form, zoneId: id, localityId: "" });
    const { data } = await api.get(`/geo/localities?zoneId=${id}`);
    setGeo((g) => ({ ...g, localities: data }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/signup", form);
      navigate("/login");
    } catch {
      setError("Signup failed. Please check details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* HEADER */}
      <header className="auth-header">
        <div className="auth-logo">CivicSense</div>
        <div className="auth-actions">
          <Link to="/login">Sign in</Link>
          <Link to="/signup" className="primary">Register</Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="auth-main">
        {/* LEFT FORM */}
        <div className="auth-left auth-scroll">
          <h1>Join your civic community</h1>
          <p className="auth-subline">
            Report issues, track progress, and improve your city.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              placeholder="Full name"
              required
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Email address"
              required
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <select required value={form.cityId} onChange={(e) => handleCity(e.target.value)}>
              <option value="">Select city</option>
              {geo.cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select required value={form.zoneId} onChange={(e) => handleZone(e.target.value)}>
              <option value="">Select zone</option>
              {geo.zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>

            <select
              required
              value={form.localityId}
              onChange={(e) =>
                setForm({ ...form, localityId: e.target.value })
              }
            >
              <option value="">Select locality</option>
              {geo.localities.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            <button disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

        {/* RIGHT IMAGE */}
        {/* <div className="auth-right">
          <img src={authImage} alt="Community illustration" />
        </div> */}
      </main>
    </div>
  );
};

export default Signup;
