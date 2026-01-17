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

  /* ===================== FETCH COMMENTS INIT ===================== */
  useEffect(() => {
    api
      .get(`/issues/${issue.id}/comments`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setComments(res.data);
        }
      })
      .catch(() => {});
  }, [issue.id]);

  /* ===================== SYNC UPVOTE COUNT ===================== */
  useEffect(() => {
    setUpvoteCount(issue.upvoteCount || 0);
  }, [issue.upvoteCount]);

  /* ===================== STATUS COLOR ===================== */
  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'bg-blue-100 text-blue-700 border-blue-200',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      RESOLVED_PENDING_USER: 'bg-green-100 text-green-700 border-green-200',
      CLOSED: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status] || colors.OPEN;
  };

  /* ===================== HANDLE UPVOTE ===================== */
  const handleUpvote = async () => {
    if (!user?.id) {
      alert('Please login to upvote');
      return;
    }

    try {
      const res = await api.post(
        `/issues/${issue.id}/upvote`,
        {},
        { withCredentials: true }
      );

      setUpvoteCount(res.data._count?.upvotes ?? upvoteCount);
      setUpvoted(res.data.hasUpvoted ?? !upvoted);

      onRefresh?.();
    } catch (err) {
      console.error('Upvote failed', err);
      alert('Failed to toggle upvote');
    }
  };

  /* ===================== FETCH COMMENTS ===================== */
  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/issues/${issue.id}/comments`);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch comments failed', err);
    }
  };

  /* ===================== ADD COMMENT ===================== */
  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;
    if (!user?.id) {
      alert('Login required');
      return;
    }

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
    } catch (err) {
      alert('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  /* ===================== MEDIA ===================== */
  const media = issue.media || [];
  const currentMedia = media[mediaIndex];

  const authorName =
    issue?.postedBy?.name ||
    issue?.postedBy?.email?.split('@')[0] ||
    'Anonymous';

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition border border-gray-200 overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm">
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{authorName}</p>
            <p className="text-xs text-gray-500">
              {new Date(issue.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(
            issue.status
          )}`}
        >
          {issue.status}
        </span>
      </div>

      {/* TITLE */}
      <div className="px-4 sm:px-5 pb-2">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">
          {issue.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500">{issue.locality}</p>
      </div>

      {/* MEDIA */}
      {currentMedia && (
        <div className="w-full bg-gray-100">
          {currentMedia.type === 'VIDEO' ? (
            <video
              src={currentMedia.url}
              controls
              className="w-full max-h-[300px] sm:max-h-[400px] object-cover"
            />
          ) : (
            <img
              src={currentMedia.url}
              alt="issue"
              className="w-full max-h-[300px] sm:max-h-[400px] object-cover"
            />
          )}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 border-b border-gray-200">
        <button
          onClick={handleUpvote}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold transition ${
            upvoted
              ? 'bg-pink-100 text-pink-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ↑ {upvoteCount}
        </button>

        <button
          onClick={() => {
            setShowComments(!showComments);
            if (!showComments) fetchComments();
          }}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition"
        >
          💬 Comments {comments.length > 0 && `(${comments.length})`}
        </button>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="px-4 sm:px-5 py-3 space-y-3">
          {comments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center">
              No comments yet
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xs">
                  {c.user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="bg-gray-100 rounded-2xl p-2 flex-1">
                  <p className="text-sm">{c.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {c.user?.fullName ||
                      c.user?.email?.split('@')[0] ||
                      'Anonymous'}{' '}
                    • {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}

          <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
            <button
              disabled={loading}
              className="px-4 py-2 rounded-full bg-pink-500 text-white text-sm font-bold hover:bg-pink-600 transition disabled:opacity-50"
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
