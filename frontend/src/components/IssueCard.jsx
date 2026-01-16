import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const IssueCard = ({ issue, isCreator, onRefresh }) => {
  const { user } = useAuth();

  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(issue.upvoteCount || 0);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [mediaIndex, setMediaIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ---------------- FIX #1: preload comments for count ---------------- */
  useEffect(() => {
    api
      .get(`/issues/${issue.id}/comments`)
      .then((res) => {
        if (Array.isArray(res.data)) setComments(res.data);
      })
      .catch(() => {});
  }, [issue.id]);

  useEffect(() => {
    setUpvoteCount(issue.upvoteCount || 0);
  }, [issue]);

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'bg-blue-100 text-blue-700 border-blue-200',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      RESOLVED_PENDING_USER: 'bg-green-100 text-green-700 border-green-200',
      CLOSED: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status] || colors.OPEN;
  };

  const handleUpvote = async () => {
    if (!user?.id) return alert('Please login to upvote');

    try {
      await api.post(`/issues/${issue.id}/upvote`);
      setUpvoted(!upvoted);
      setUpvoteCount((prev) => (upvoted ? prev - 1 : prev + 1));
      onRefresh?.();
    } catch {
      alert('Upvote failed');
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/issues/${issue.id}/comments`);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch comments failed', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user?.id) return alert('Login required');

    setLoading(true);
    try {
      await api.post(
        `/issues/${issue.id}/comments`,
        { content: newComment },
        { withCredentials: true }
      );
      setNewComment('');
      fetchComments();
      onRefresh?.();
    } catch {
      alert('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const media = issue.media || [];
  const currentMedia = media[mediaIndex];

  const authorName =
    issue?.postedBy?.name ||
    issue?.postedBy?.email?.split('@')[0] ||
    'Anonymous';

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border hover:shadow-2xl transition">

      {/* HEADER */}
      <div className="mb-4">
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(issue.status)}`}>
          {issue.status}
        </span>

        <h3 className="text-2xl font-black text-gray-900 mt-2">
          {issue.title}
        </h3>

        <p className="text-sm text-gray-500">
          {issue.locality} • {new Date(issue.createdAt).toLocaleDateString()}
        </p>

        <p className="text-sm font-semibold text-gray-600">
          Reported by <span className="text-indigo-600">{authorName}</span>
        </p>
      </div>

      {/* MEDIA */}
      {currentMedia && (
        <div className="rounded-xl overflow-hidden mb-4">
          {currentMedia.type === 'VIDEO' ? (
            <video src={currentMedia.url} controls />
          ) : (
            <img src={currentMedia.url} alt="issue" className="w-full h-56 object-cover" />
          )}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleUpvote}
          className="px-4 py-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 font-bold"
        >
          👍 {upvoteCount}
        </button>

        <button
          onClick={() => {
            setShowComments(!showComments);
            if (!showComments) fetchComments();
          }}
          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold"
        >
          💬 Comments {comments.length > 0 && `(${comments.length})`}
        </button>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="mt-4 border-t pt-4 space-y-3">
          {comments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center">No comments yet</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">{c.content}</p>

                {/* ---------------- FIX #2: correct author field ---------------- */}
                <p className="text-xs text-gray-500">
                  {c.user?.fullName || c.user?.email?.split('@')[0] || 'Anonymous'} •{' '}
                  {new Date(c.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border rounded-xl px-4 py-2"
            />
            <button
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default IssueCard;
