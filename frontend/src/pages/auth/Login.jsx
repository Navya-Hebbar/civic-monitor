import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
// import authImage from "../../assets/authimage.png";
import "./Auth.css";

const Login = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    await api.post("/auth/login", form); // cookie is set here

    const { data } = await api.get("/users/me"); // cookie auto sent
    setUser(data);

    localStorage.setItem("user", JSON.stringify(data)); // cache only
    navigate("/feed");
  } catch {
    setError("Invalid email or password");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-root">
      <header className="auth-header">
        <div className="auth-logo">CivicSense</div>
        <div className="auth-actions">
          <Link to="/signup">Register</Link>
          <Link to="/login" className="primary">Sign in</Link>
        </div>
      </header>

      <main className="auth-main">
        <div className="auth-left">
          <h1>Find solutions through your community</h1>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email address"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <div className="auth-forgot">Forgot password?</div>

            <button disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>

            {/* <div className="auth-divider">
              <span>or</span>
            </div>

            <button type="button" className="secondary">
              Continue as guest
            </button> */}
          </form>
        </div>

        {/* <div className="auth-right">
          <img src={authImage} alt="Community" />
        </div> */}
      </main>
    </div>
  );
};

export default Login;
