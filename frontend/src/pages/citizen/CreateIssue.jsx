import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CreateIssue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // FORM
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    cityId: '',
    zoneId: '',
    localityId: '',
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // DROPDOWNS
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [zones, setZones] = useState([]);
  const [localities, setLocalities] = useState([]);

  /* ------------------ AUTH CHECK ------------------ */
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  /* ------------------ FETCH INITIAL DATA ------------------ */
  useEffect(() => {
    fetchCategories();
    fetchCities();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/issues/categories');
      setCategories(res.data);
    } catch {
      setError('Failed to load categories');
    }
  };

  const fetchCities = async () => {
    try {
      const res = await api.get('/geo/cities');
      setCities(res.data);
    } catch {
      setError('Failed to load cities');
    }
  };

  const fetchZones = async (cityId) => {
    try {
      const res = await api.get(`/geo/zones?cityId=${cityId}`);
      setZones(res.data);
      setLocalities([]);
    } catch {
      setError('Failed to load zones');
    }
  };

  const fetchLocalities = async (zoneId) => {
    try {
      const res = await api.get(`/geo/localities?zoneId=${zoneId}`);
      setLocalities(res.data);
    } catch {
      setError('Failed to load localities');
    }
  };

  /* ------------------ SUBMIT ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryId || !formData.localityId) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/issues', {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        localityId: formData.localityId,
      });

      if (file && res.data.issueId) {
        const media = new FormData();
        media.append('file', file);

        await api.post(`/issues/${res.data.issueId}/media`, media, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate('/feed');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Issue creation failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 px-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">

        {/* LEFT PAGE (BOOK STYLE) */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-10">
          <h2 className="text-4xl font-bold mb-4">Report Issues</h2>
          <p className="opacity-80 text-center">
            Your voice helps improve your city.
          </p>
        </div>

        {/* RIGHT PAGE (FORM) */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              placeholder="Issue title"
              className="w-full p-3 rounded-xl border"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Describe the issue"
              rows={4}
              className="w-full p-3 rounded-xl border"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />

            <select
              className="w-full p-3 rounded-xl border"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="w-full p-3 rounded-xl border"
              value={formData.cityId}
              onChange={(e) => {
                setFormData({ ...formData, cityId: e.target.value, zoneId: '', localityId: '' });
                fetchZones(e.target.value);
              }}
              required
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              className="w-full p-3 rounded-xl border"
              value={formData.zoneId}
              onChange={(e) => {
                setFormData({ ...formData, zoneId: e.target.value, localityId: '' });
                fetchLocalities(e.target.value);
              }}
              required
            >
              <option value="">Select Zone</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>

            <select
              className="w-full p-3 rounded-xl border"
              value={formData.localityId}
              onChange={(e) =>
                setFormData({ ...formData, localityId: e.target.value })
              }
              required
            >
              <option value="">Select Locality</option>
              {localities.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold"
            >
              {loading ? 'Submitting...' : 'Submit Issue'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateIssue;
