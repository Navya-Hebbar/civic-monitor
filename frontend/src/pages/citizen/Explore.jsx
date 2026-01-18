import { useEffect, useState, useRef, useCallback } from "react";
import api from "../../api/axios";
import IssueCard from "../../components/IssueCard";
import Loader from "../../components/Loader";
import "./Explore.css";
import LeftSidebar from "../../components/LeftSidebar";
import RightSidebar from "../../components/RightSidebar";
import RightSidebarGlobal from "../../components/RightSidebarGlobal";


const BATCH_SIZE = 5;
const ALLOWED_STATUSES = ["OPEN", "IN_PROGRESS"];

const Explore = () => {
  const [allIssues, setAllIssues] = useState([]);
  const [visibleIssues, setVisibleIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const observerRef = useRef(null);

  /* ---------------- FETCH ONCE ---------------- */

  const fetchExploreFeed = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/issues/explore");

      const normalized = Array.isArray(data)
        ? data.filter((i) => ALLOWED_STATUSES.includes(i.status))
        : [];

      setAllIssues(normalized);
      setVisibleIssues(normalized.slice(0, BATCH_SIZE));

      setPage(1);
    } catch {
      setAllIssues([]);
      setVisibleIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExploreFeed();
  }, []);

  /* ---------------- SEARCH FILTER ---------------- */

  useEffect(() => {
    const source = !searchQuery.trim()
      ? allIssues
      : allIssues.filter(
          (i) =>
            i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.locality?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    setVisibleIssues(source.slice(0, BATCH_SIZE));
    setPage(1);
  }, [searchQuery, allIssues]);

  /* ---------------- LOAD MORE ---------------- */

  const loadMore = useCallback(() => {
    const source = !searchQuery.trim()
      ? allIssues
      : allIssues.filter(
          (i) =>
            i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.locality?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const nextPage = page + 1;
    const nextItems = source.slice(0, nextPage * BATCH_SIZE);

    setVisibleIssues(nextItems);
    setPage(nextPage);
  }, [page, allIssues, searchQuery]);

  /* ---------------- INTERSECTION OBSERVER ---------------- */

  const lastItemRef = useCallback(
    (node) => {
      if (loading) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loadMore, loading]
  );

  if (loading) return <Loader />;

  return (
    <div className="explore-page">
      <div className="page-layout">
        <LeftSidebar />

        <div className="explore-container">
          <div className="explore-header">
            <h1 className="explore-title">Explore Issues</h1>
            <p className="explore-subtitle">
              City-wide civic issues reported by citizens
            </p>

            <div className="explore-toolbar">
              <input
                className="explore-search"
                placeholder="Search by issue or locality"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <button
                className="explore-refresh"
                onClick={fetchExploreFeed}
              >
                Refresh
              </button>
            </div>

            <div className="explore-count">
              {visibleIssues.length} issue
              {visibleIssues.length !== 1 && "s"} shown
            </div>
          </div>

          {visibleIssues.length === 0 ? (
            <div className="explore-empty">
              <h3>No issues found</h3>
              <p>Try changing your search terms.</p>
            </div>
          ) : (
            <div className="explore-list">
              {visibleIssues.map((issue, idx) => {
                const isLast = idx === visibleIssues.length - 1;
                return (
                  <div
                    key={issue.id}
                    ref={isLast ? lastItemRef : null}
                  >
                    <IssueCard issue={issue} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <RightSidebar />
        <RightSidebarGlobal />

      </div>
    </div>
  );
};

export default Explore;
