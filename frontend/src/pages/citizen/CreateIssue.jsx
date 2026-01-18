import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./CreateIssue.css";

const CreateIssue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    cityId: "",
    zoneId: "",
    localityId: "",
  });

  const [files, setFiles] = useState([]); // ✅ FIXED
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [zones, setZones] = useState([]);
  const [localities, setLocalities] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchInitialData();
  }, [user, navigate]);

  const fetchInitialData = async () => {
    try {
      const [catRes, cityRes] = await Promise.all([
        api.get("/issues/categories", { withCredentials: true }),
        api.get("/geo/cities", { withCredentials: true }),
      ]);
      setCategories(catRes.data);
      setCities(cityRes.data);
    } catch {
      setError("Failed to load initial data");
    }
  };

  const fetchZones = async (cityId) => {
    const { data } = await api.get(`/geo/zones?cityId=${cityId}`, {
      withCredentials: true,
    });
    setZones(data);
    setLocalities([]);
  };

  const fetchLocalities = async (zoneId) => {
    const { data } = await api.get(`/geo/localities?zoneId=${zoneId}`, {
      withCredentials: true,
    });
    setLocalities(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryId || !formData.localityId) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post(
        "/issues",
        {
          title: formData.title,
          description: formData.description,
          categoryId: formData.categoryId,
          localityId: formData.localityId,
        },
        { withCredentials: true }
      );

      const issueId = res.data?.issueId;
      if (!issueId) throw new Error("Issue ID missing");

      // ✅ MULTI FILE UPLOAD
      for (const file of files) {
        const media = new FormData();
        media.append("file", file);

        await api.post(`/issues/${issueId}/media`, media, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/feed");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Issue creation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">
      <div className="create-container">
        <div className="create-card">
          <h1 className="create-title">Report an issue</h1>

          {error && <div className="create-error">{error}</div>}

<form className="create-form" onSubmit={handleSubmit}>
  <div className="create-field">
    <label>Issue title</label>
    <input
      required
      value={formData.title}
      onChange={(e) =>
        setFormData({ ...formData, title: e.target.value })
      }
    />
  </div>

  <div className="create-field">
    <label>Description</label>
    <textarea
      required
      value={formData.description}
      onChange={(e) =>
        setFormData({ ...formData, description: e.target.value })
      }
    />
  </div>

  <div className="create-field">
    <label>Category</label>
    <select
      required
      value={formData.categoryId}
      onChange={(e) =>
        setFormData({ ...formData, categoryId: e.target.value })
      }
    >
      <option value="">Select category</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  </div>

  <div className="create-field">
    <label>City</label>
    <select
      required
      value={formData.cityId}
      onChange={(e) => {
        setFormData({
          ...formData,
          cityId: e.target.value,
          zoneId: "",
          localityId: "",
        });
        fetchZones(e.target.value);
      }}
    >
      <option value="">Select city</option>
      {cities.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  </div>

  <div className="create-field">
    <label>Zone</label>
    <select
      required
      value={formData.zoneId}
      onChange={(e) => {
        setFormData({
          ...formData,
          zoneId: e.target.value,
          localityId: "",
        });
        fetchLocalities(e.target.value);
      }}
    >
      <option value="">Select zone</option>
      {zones.map((z) => (
        <option key={z.id} value={z.id}>{z.name}</option>
      ))}
    </select>
  </div>

  <div className="create-field">
    <label>Locality</label>
    <select
      required
      value={formData.localityId}
      onChange={(e) =>
        setFormData({ ...formData, localityId: e.target.value })
      }
    >
      <option value="">Select locality</option>
      {localities.map((l) => (
        <option key={l.id} value={l.id}>{l.name}</option>
      ))}
    </select>
  </div>

  <div className="create-field">
    <label>Attach photos or videos</label>
    <input
      type="file"
      accept="image/*,video/*"
      multiple
      onChange={(e) => setFiles(Array.from(e.target.files))}
    />

    {files.length > 0 && (
      <div className="create-previews">
        {files.map((file, idx) => (
          <div key={idx} className="preview-item">
            {file.type.startsWith("image") ? (
              <img src={URL.createObjectURL(file)} alt="" />
            ) : (
              <video src={URL.createObjectURL(file)} />
            )}
          </div>
        ))}
      </div>
    )}
  </div>

  <div className="create-actions">
    <button className="create-submit" disabled={loading}>
      {loading ? "Submitting..." : "Submit issue"}
    </button>
  </div>
</form>

        </div>
      </div>
    </div>
  );
};

export default CreateIssue;
