import { useEffect, useState } from 'react';
import api from '../../api/axios';
import IssueCard from '../../components/IssueCard';
import Loader from '../../components/Loader';

const Explore = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchExploreFeed = async () => {
    try {
      const { data } = await api.get('/issues/explore');

      const apiIssues = Array.isArray(data)
        ? data.map((issue) => ({
            ...issue,
            upvoteCount: issue?._count?.upvotes ?? 0,
            commentCount: issue?._count?.comments ?? 0,
          }))
        : [];

      setIssues(apiIssues);
      setFilteredIssues(apiIssues);
    } catch (err) {
      console.error("❌ Explore feed error:", err);
      setIssues([]);
      setFilteredIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExploreFeed();
  }, []);

  // Filter issues based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredIssues(issues);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredIssues(
        issues.filter(
          (issue) =>
            issue.title.toLowerCase().includes(lowerQuery) ||
            (issue.locality && issue.locality.toLowerCase().includes(lowerQuery))
        )
      );
    }
  }, [searchQuery, issues]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pb-28 sm:pb-32 pt-20 sm:pt-24 relative overflow-hidden font-sans">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Explore Issues
          </h1>
          <p className="text-gray-600 text-base sm:text-lg font-medium mb-4">
            Discover trending and urgent issues across the city
          </p>

          {/* Search + Summary */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issues by title or locality..."
              className="w-full md:flex-1 px-4 sm:px-5 py-3 rounded-2xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base"
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="px-4 sm:px-5 py-3 bg-white shadow-md rounded-2xl border border-gray-200">
                <span className="text-xs sm:text-sm font-semibold text-gray-800">
                  {filteredIssues.length} {filteredIssues.length === 1 ? 'Issue' : 'Issues'} Found
                </span>
              </div>
              <button
                onClick={fetchExploreFeed}
                className="w-full sm:w-auto px-5 py-3 bg-blue-600 text-white rounded-2xl font-semibold text-sm hover:bg-blue-700 transition-shadow shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                Refresh
              </button>
            </div>
          </div>
        </header>

        {/* Issues Grid */}
        {filteredIssues.length === 0 ? (
          <div className="text-center py-16 sm:py-24 bg-white rounded-3xl border border-gray-200 shadow-md">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              No Issues Found
            </h3>
            <p className="text-gray-600 text-base sm:text-lg font-medium">
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {filteredIssues.map((issue, index) => (
              <div 
                key={issue.id} 
                className="group transition-all duration-500 transform hover:scale-105"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <IssueCard 
                  issue={issue} 
                  onRefresh={fetchExploreFeed} 
                  className="rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden"
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
