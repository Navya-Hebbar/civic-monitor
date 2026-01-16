import { useEffect, useState } from 'react';
import api from '../../api/axios';
import IssueCard from '../../components/IssueCard';
import Loader from '../../components/Loader';

const Explore = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExploreFeed = async () => {
    try {
      // Fetch from backend (cloud storage) - Shows all issues in the city
      const { data } = await api.get('/issues/explore'); 
      const apiIssues = Array.isArray(data) ? data : [];
      setIssues(apiIssues);
    } catch (err) {
      console.error("❌ Explore feed error:", err);
      if (err.response?.status === 401) {
        console.error('🔐 Authentication required for explore feed');
      }
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExploreFeed();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 via-indigo-50 to-cyan-50 pb-32 pt-24 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 opacity-20 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-400 opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-br from-indigo-400 to-purple-400 opacity-15 blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform duration-300">
              <span className="text-4xl">🌍</span>
            </div>
            <div>
              <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 mb-2">
                Explore
              </h1>
              <p className="text-gray-700 font-semibold text-lg">
                Discover trending and urgent issues across the entire city
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-6 py-3 bg-white/90 backdrop-blur-xl rounded-2xl border-2 border-purple-200 shadow-xl">
              <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {issues.length} {issues.length === 1 ? 'Issue' : 'Issues'} Citywide
              </span>
            </div>
            <button
              onClick={fetchExploreFeed}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-black text-sm hover:from-purple-600 hover:to-pink-600 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
            >
              Refresh
            </button>
          </div>
        </header>

        {/* Issues Grid */}
        {issues.length === 0 ? (
          <div className="text-center py-24 bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-purple-200/50 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50" />
            <div className="relative z-10">
              <div className="text-8xl mb-6 animate-bounce">🔍</div>
              <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-3">
                No Issues Found
              </h3>
              <p className="text-gray-600 text-lg font-semibold">Check back later for city-wide issues.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {issues.map((issue, index) => (
              <div 
                key={issue.issueId} 
                className="group transition-all duration-500 transform hover:scale-105"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <IssueCard 
                  issue={issue} 
                  onRefresh={fetchExploreFeed} 
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;