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
    <div className="pt-20 sm:pt-24 min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pb-32 sm:pb-40 relative overflow-hidden font-sans">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight"
              style={{ fontFamily: "'Instagram Sans', 'Helvetica Neue', sans-serif" }}
            >
              My Locality Feed
            </h1>
            <p className="text-pink-500 font-semibold text-sm mt-1 tracking-wide">
              {user?.localityName || user?.locality?.name || "Community Updates"}
            </p>
          </div>

          <button
            onClick={fetchFeed}
            className="self-start sm:self-auto px-5 sm:px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-full hover:scale-105 transform transition shadow-md"
          >
            Refresh
          </button>
        </div>

        {/* CAROUSEL SUMMARY */}
        <div className="flex space-x-4 overflow-x-auto py-3 sm:py-4 mb-8 sm:mb-10 scrollbar-hide">
          {summaryCards.map((card, idx) => (
            <div
              key={idx}
              className="min-w-[160px] sm:min-w-[180px] bg-white/60 backdrop-blur-md border border-white/30 rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col items-center justify-center hover:shadow-2xl transition cursor-pointer"
            >
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-wide">
                {card.value}
              </span>
              <span className="text-gray-600 mt-1 text-xs sm:text-sm font-semibold">
                {card.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FEED CARDS */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {issues.length > 0 ? (
          issues.map((issue, index) => (
            <div
              key={issue.issueId || index}
              className="bg-white/50 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition cursor-pointer border border-white/20"
            >
              <IssueCard
                issue={issue}
                isCreator={user?.id === issue.creatorId || user?.userId === issue.creatorId}
                onRefresh={fetchFeed}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 sm:py-20 bg-white/50 backdrop-blur-md rounded-3xl border border-white/20 shadow-lg">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
              All Clear!
            </h3>
            <p className="text-gray-700 text-base sm:text-lg">
              No active issues in your locality.
              <br />
              <span className="text-pink-500 font-semibold">Enjoy the calm ✨</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
