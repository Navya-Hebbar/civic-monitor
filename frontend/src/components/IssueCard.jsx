import { useEffect, useState } from "react";
import api from "../api/axios";
import CommentsSection from "./CommentsSection";
import { FaArrowUp, FaRegComment } from "react-icons/fa";
import "./IssueCard.css";

const IssueCard = ({ issue }) => {
  const [upvoteCount, setUpvoteCount] = useState(issue.upvotes ?? 0);
  const [commentCount, setCommentCount] = useState(issue.comments ?? 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteLoading, setUpvoteLoading] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  useEffect(() => {
    setUpvoteCount(issue.upvotes ?? 0);
    setCommentCount(issue.comments ?? 0);
  }, [issue.upvotes, issue.comments]);

  /* ---------------- COMMENTS ---------------- */

  const prefetchComments = async () => {
    if (commentsLoaded) return;

    try {
      const { data } = await api.get(`/issues/${issue.id}/comments`);
      const list = Array.isArray(data) ? data : [];
      setComments(list);
      setCommentCount(list.length);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoaded(true);
    }
  };

  /* ---------------- UPVOTE ---------------- */

  const handleUpvote = async () => {
    if (upvoteLoading) return;

    try {
      setUpvoteLoading(true);

      await api.post(`/issues/${issue.id}/upvote`);

      setHasUpvoted((p) => !p);
      setUpvoteCount((p) =>
        hasUpvoted ? Math.max(p - 1, 0) : p + 1
      );
    } catch (err) {
      console.error("Upvote failed", err);
    } finally {
      setUpvoteLoading(false);
    }
  };

  return (
    <div className="issue-card">

      {/* HEADER */}
      <div className="issue-header">
          <div className="issue-avatar">
            {issue.postedBy?.profilePhotoUrl || issue.postedBy?.avatar ? (
              <img
                src={issue.postedBy.profilePhotoUrl || issue.postedBy.avatar}
                alt={issue.postedBy.name}
              />
            ) : (
              <span>
                {issue.postedBy?.name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>

        <div className="issue-meta">
          <div className="issue-author">{issue.postedBy?.name}</div>
          <div className="issue-submeta">
            {issue.locality} •{" "}
            {new Date(issue.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className={`issue-status status-${issue.status.toLowerCase()}`}>
          {issue.status}
        </div>
      </div>

      {/* CONTENT */}
      <div className="issue-content">
        <p className="issue-title">{issue.title}</p>

        <div className="issue-tags">
          <span className="issue-tag">{issue.category}</span>
          <span className="issue-sep">•</span>
          <span className="issue-tag">{issue.department}</span>
          <span className="issue-sep">•</span>
          <span className="issue-tag">{issue.locality}</span>
        </div>

        {issue.description && (
          <p className="issue-description">
            {issue.description}
          </p>
        )}
      </div>

      {/* MEDIA */}
      {issue.media?.length > 0 && (
        <div className="issue-media">
          {issue.media.map((m, idx) => (
            <img key={idx} src={m.url} alt="Issue media" />
          ))}
        </div>
      )}

      {/* STATS */}
      <div className="issue-stats">
        <span>{upvoteCount} upvotes</span>
        <span>{commentCount} comments</span>
      </div>

      {/* ACTIONS */}
      <div className="issue-actions">
        <button
          type="button"
          className={hasUpvoted ? "upvoted" : ""}
          onClick={handleUpvote}
          disabled={upvoteLoading}
        >
          <FaArrowUp />
          {hasUpvoted ? "Upvoted" : "Upvote"}
        </button>

        <button
          type="button"
          onMouseEnter={prefetchComments}
          onClick={() => {
            prefetchComments();
            setShowComments((p) => !p);
          }}
        >
          <FaRegComment />
          Comment
        </button>
      </div>

      {/* COMMENTS INLINE */}
      {showComments && (
        <CommentsSection
          issueId={issue.id}
          comments={comments}
          setComments={(c) => {
            setComments(c);
            setCommentCount(c.length);
          }}
        />
      )}
    </div>
  );
};

export default IssueCard;
