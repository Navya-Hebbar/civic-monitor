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

  const fetchFeed = async () => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get("/issues/feed");
      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.response?.status === 401) {
        window.dispatchEvent(new CustomEvent("auth:logout"));
        navigate("/login");
      } else {
        console.error("Feed fetch failed:", err);
      }
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [user, authLoading]);

  if (loading || authLoading) return <Loader />;

  // Prepare carousel summary
  const totalIssues = issues.length;
  const openIssues = issues.filter(i => i.status === "OPEN").length;
  const resolvedIssues = issues.filter(i => i.status === "RESOLVED").length;

  const summaryCards = [
    { title: "Total Issues", value: totalIssues },
    { title: "Open Issues", value: openIssues },
    { title: "Resolved Issues", value: resolvedIssues },
  ];

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-indigo-50 via-white via-pink-50 to-purple-50 pb-40 relative overflow-hidden">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto px-6 mb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              My Locality Feed
            </h1>
            <p className="text-indigo-600 font-semibold text-sm mt-1">
              {user?.localityName || user?.locality?.name || "Community Updates"}
            </p>
          </div>

          <button
            onClick={fetchFeed}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-md"
          >
            Refresh
          </button>
        </div>

        {/* CAROUSEL SUMMARY */}
        <div className="flex space-x-4 overflow-x-auto py-4 mb-10">
          {summaryCards.map((card, idx) => (
            <div
              key={idx}
              className="min-w-[180px] bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-5 shadow-lg flex flex-col items-center justify-center hover:shadow-xl transition cursor-pointer"
            >
              <span className="text-2xl font-bold text-gray-900">{card.value}</span>
              <span className="text-gray-700 mt-1">{card.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FEED CARDS */}
      <div className="relative max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {issues.length > 0 ? (
          issues.map((issue, index) => (
            <div
              key={issue.issueId || index}
              className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer border border-white/20"
            >
              <IssueCard
                issue={issue}
                isCreator={user?.id === issue.creatorId || user?.userId === issue.creatorId}
                onRefresh={fetchFeed}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
            <h3 className="text-3xl font-bold text-gray-800 mb-3">
              All Clear!
            </h3>
            <p className="text-gray-700">
              No active issues in your locality.
              <br />
              <span className="text-indigo-500 font-medium">Enjoy the calm ✨</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
