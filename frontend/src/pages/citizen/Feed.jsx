import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import IssueCard from "../../components/IssueCard";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/AuthContext";

const Feed = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // ✅ Fetch feed ONLY when auth is ready
  const fetchFeed = async () => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      console.log("📤 Fetching locality feed...", {
        userId: user.id,
      });

      const { data } = await api.get("/issues/feed");

      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.response?.status === 401) {
        console.error("❌ Unauthorized, logging out");
        window.dispatchEvent(new CustomEvent("auth:logout"));
        navigate("/login");
      } else {
        console.error("❌ Feed fetch failed:", err);
      }
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch on auth ready
  useEffect(() => {
    fetchFeed();
  }, [user, authLoading]);

  if (loading || authLoading) return <Loader />;

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-indigo-50 via-white via-pink-50 to-purple-50 pb-40 relative overflow-hidden">

      {/* HEADER */}
      <div className="max-w-4xl mx-auto px-6 mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🏘️</span>
            </div>
            <div>
              <h1 className="text-5xl font-extrabold text-gray-900">
                My Locality Feed
              </h1>
              <p className="text-indigo-600 font-bold text-sm mt-1">
                {user?.localityName ||
                  user?.locality?.name ||
                  "Community Updates"}
              </p>
            </div>
          </div>

          <button
            onClick={fetchFeed}
            className="px-6 py-3 bg-white/90 backdrop-blur-xl border-2 border-indigo-200 rounded-xl font-black text-sm hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* FEED */}
      <div className="relative max-w-4xl mx-auto px-6 space-y-6">
        {issues.length > 0 ? (
          issues.map((issue, index) => (
            <IssueCard
              key={issue.issueId || index}
              issue={issue}
              isCreator={
                user?.id === issue.creatorId ||
                user?.userId === issue.creatorId
              }
              onRefresh={fetchFeed}
            />
          ))
        ) : (
          <div className="text-center py-24 bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-indigo-200 shadow-2xl">
            <div className="text-8xl mb-6">🏙️</div>
            <h3 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent mb-3">
              All Clear!
            </h3>
            <p className="text-gray-600 font-semibold">
              No active issues in your locality.
              <br />
              <span className="text-indigo-500">Enjoy the calm ✨</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
