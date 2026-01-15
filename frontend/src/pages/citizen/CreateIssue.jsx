import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CreateIssue = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', categoryId: '', localityId: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Hardcoded localities (replace/add as needed)
  const localities = [
    { id: '2f466831-1067-4700-9429-a84ad7e06499', name: 'MG Road' },
    { id: 'abcd1234-5678-90ef-ghij-1234567890ab', name: 'Brigade Road' },
    { id: 'xyz98765-4321-0abc-def1-234567890abc', name: 'Koramangala' },
  ];

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/issues/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('❌ Failed to load categories:', err);
        if (err.response?.status === 401) {
          setError('Authentication required. Please login.');
        } else {
          setError('Failed to load categories. Please refresh the page.');
        }
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }
    if (!formData.localityId) {
      setError('Please select a locality');
      return;
    }

    if (!user || !user.id) {
      setError('Please login to create issues.');
      navigate('/login');
      return;
    }

    if (user.id?.startsWith('demo-')) {
      setError('Demo mode disabled. Please login with a real account.');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create issue
      const res = await api.post('/issues', {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        localityId: formData.localityId,
      });

      // Upload media if file exists
      if (file && res.data.issueId) {
        const mediaData = new FormData();
        mediaData.append('file', file);
        await api.post(`/issues/${res.data.issueId}/media`, mediaData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // Navigate to feed after success
      navigate('/feed');
    } catch (err) {
      console.error('❌ Issue creation failed:', err);
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message || err.response.data?.error || 'Unknown error';
        setError(`Failed to create issue: ${message} (Status: ${status})`);
      } else if (err.request) {
        setError('Network error: Cannot reach server.');
      } else {
        setError('Failed to create issue. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-rose-50 py-12 px-4 relative overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-3">
            Report an Issue
          </h1>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-indigo-200/50 relative overflow-hidden">
          <div className="relative z-10">
            {error && <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Issue Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Broken street light on Main Street"
                  className="w-full p-4 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-indigo-500 focus:bg-white"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full p-4 rounded-xl bg-gray-50 border-2 border-gray-200"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat.department ? `(${cat.department})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Locality */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Locality *</label>
                <select
                  value={formData.localityId}
                  onChange={(e) => setFormData({ ...formData, localityId: e.target.value })}
                  className="w-full p-4 rounded-xl bg-gray-50 border-2 border-gray-200"
                  required
                >
                  <option value="">Select a locality</option>
                  {localities.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information about the issue..."
                  rows={6}
                  className="w-full p-4 rounded-xl bg-gray-50 border-2 border-gray-200"
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Photo/Video (Optional)</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full p-4 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300"
                />
                {file && <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-black text-xl"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateIssue;
