import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const IssueCard = ({ issue, isCreator, onRefresh }) => {
  const { user } = useAuth();
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(issue.upvoteCount || 0);
  
  // Load upvote state from issue data
  useEffect(() => {
    setUpvoteCount(issue.upvoteCount || 0);
  }, [issue]);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [mediaIndex, setMediaIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Comments will be loaded from API when user clicks to view them

  const getStatusColor = (status) => {
    const colors = {
      'OPEN': 'bg-blue-100 text-blue-700 border-blue-200',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'RESOLVED_PENDING_USER': 'bg-green-100 text-green-700 border-green-200',
      'CLOSED': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handleUpvote = async () => {
    if (!user || !user.id) {
      alert('Please login to upvote issues.');
      return;
    }
    
    try {
      console.log('📤 Upvoting via API...', { issueId: issue.id });
      await api.post(`/issues/${issue.id}/upvote`);
      
      console.log('✅ Upvote successful');
      
      const newUpvoted = !upvoted;
      const newCount = newUpvoted ? upvoteCount + 1 : upvoteCount - 1;
      setUpvoted(newUpvoted);
      setUpvoteCount(newCount);
      
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('❌ Upvote failed:', err);
      
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          alert('Please login to upvote issues.');
        } else {
          alert(`Failed to upvote: ${err.response.data?.message || 'Unknown error'}`);
        }
      } else {
        alert('Network error. Please try again.');
      }
    }
  };

  const fetchComments = async () => {
    try {
      // Fetch comments from backend (cloud storage) - NO localStorage fallback
      const { data } = await api.get(`/issues/${issue.id}/comments`);
      const apiComments = Array.isArray(data) ? data : [];
      setComments(apiComments);
    } catch (err) {
      console.error('❌ Failed to fetch comments:', err);
      if (err.response?.status === 401) {
        console.error('🔐 Authentication required for comments');
      }
      setComments([]);
    }
  };

  const handleAddComment = async (e) => {
  e.preventDefault();
  if (!newComment.trim()) return;

  if (!user || !user.id) {
    alert('Please login to add comments.');
    return;
  }

  setLoading(true);

  try {
    // Save to backend (cloud storage) - NO localStorage fallback
    console.log('📤 Adding comment via API...', { issueId: issue.id });
    const response = await api.post(
      `/issues/${issue.id}/comments`,
      { content: newComment },
      { withCredentials: true } // ✅ ensure session/cookies are sent
    );

    console.log('✅ Comment added:', response.data);

    setNewComment('');
    await fetchComments(); // Refresh from backend
    if (onRefresh) onRefresh();
  } catch (err) {
    console.error('❌ Comment creation failed:', err);

    if (err.response) {
      const status = err.response.status;
      const message = err.response.data?.message || err.response.data?.error || 'Unknown error';

      if (status === 401) {
        alert('Authentication failed. Please login again.');
      } else {
        alert(`Failed to add comment: ${message}`);
      }
    } else if (err.request) {
      alert('Network error. Please check your connection.');
    } else {
      alert('Failed to add comment. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  const handleVerify = async () => {
    if (!confirm('Confirm that this issue has been resolved properly?')) return;
    
    if (!user || !user.id) {
      alert('Please login to verify issues.');
      return;
    }
    
    try {
      await api.post(`/issues/${issue.id}/verify`, { feedback: 'Resolved properly' });
      if (onRefresh) onRefresh();
      alert('Issue verified! Status updated to CLOSED.');
    } catch (err) {
      console.error('❌ Verification failed:', err);
      if (err.response?.status === 401) {
        alert('Authentication failed. Please login again.');
      } else {
        alert(err.response?.data?.message || 'Verification failed. Please try again.');
      }
    }
  };

  const media = issue.media || [];
  const currentMedia = media[mediaIndex];

  return (
    <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20 hover:border-indigo-300/50 hover:scale-[1.02]">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-pink-500/0 to-cyan-500/0 group-hover:from-indigo-500/10 group-hover:via-pink-500/5 group-hover:to-cyan-500/10 transition-all duration-700" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="relative p-6 z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black border-2 shadow-lg transform transition-all hover:scale-110 ${getStatusColor(issue.status)}`}>
                {issue.status?.replace('_', ' ') || 'OPEN'}
              </span>
              <span className="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs font-black shadow-lg transform transition-all hover:scale-110">
                {issue.categoryName || 'Category'}
              </span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-pink-600 transition-all duration-300">
              {issue.title}
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              {issue.localityName || 'Locality'} • {new Date(issue.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 leading-relaxed line-clamp-3">
          {issue.description}
        </p>

        {/* Media Carousel */}
        {media.length > 0 && (
          <div className="relative mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-video shadow-xl group-hover:shadow-2xl transition-all duration-500">
            {currentMedia && (
              currentMedia.type === 'VIDEO' ? (
                <video
                  src={currentMedia.url}
                  controls
                  className="w-full h-full object-cover"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={currentMedia.url}
                  alt={issue.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    // Fallback if image fails to load
                    console.error('Image load error:', currentMedia.url);
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    if (parent && !parent.querySelector('.error-fallback')) {
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'error-fallback w-full h-full flex items-center justify-center bg-gray-200 text-gray-500';
                      errorDiv.textContent = 'Image not available';
                      parent.appendChild(errorDiv);
                    }
                  }}
                />
              )
            )}
            {media.length > 1 && (
              <>
                <button
                  onClick={() => setMediaIndex((prev) => (prev - 1 + media.length) % media.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                >
                  ←
                </button>
                <button
                  onClick={() => setMediaIndex((prev) => (prev + 1) % media.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                >
                  →
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {media.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMediaIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === mediaIndex ? 'bg-white w-6' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all transform hover:scale-110 active:scale-95 shadow-lg ${
              upvoted
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
            }`}
          >
            <span className="text-xl transform transition-transform hover:rotate-12">🎍</span>
            <span>{upvoteCount}</span>
          </button>

          <button
            onClick={() => {
              setShowComments(!showComments);
              if (!showComments) fetchComments();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 transition-all transform hover:scale-110 active:scale-95 shadow-lg"
          >
            <span className="text-lg transform transition-transform hover:rotate-180">🔁</span>
            <span>Comments</span>
            {comments.length > 0 && (
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-black shadow-md">
                {comments.length}
              </span>
            )}
          </button>

          {isCreator && issue.status === 'RESOLVED_PENDING_USER' && (
            <button
              onClick={handleVerify}
              className="ml-auto px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-black text-sm hover:from-green-600 hover:to-emerald-600 transition-all shadow-xl transform hover:scale-110 active:scale-95"
            >
              ✓ Verify Issue
            </button>
          )}
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="max-h-64 overflow-y-auto space-y-3 mb-3">
              {comments.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No comments yet</p>
              ) : (
                comments.map((comment, idx) => {
                  const isCommentOwner = user && (comment.userId === user.id || comment.userId === user.userId);
                  
                  return (
                    <div key={comment.id || idx} className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 backdrop-blur-sm rounded-xl p-4 border border-indigo-100/50 shadow-sm hover:shadow-md transition-all group relative">
                      <p className="text-sm text-gray-800 font-medium pr-8">{comment.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500 font-semibold">
                          {comment.userName || 'Anonymous'} • {new Date(comment.createdAt).toLocaleString()}
                        </p>
                        {isCommentOwner && (
                          <button
                            onClick={async () => {
                              if (!confirm('Delete this comment?')) return;
                              
                              if (!user || !user.id) {
                                alert('Please login to delete comments.');
                                return;
                              }
                              
                              try {
                                await api.delete(`/issues/${issue.id}/comments/${comment.id}`);
                                await fetchComments(); // Refresh from backend
                                if (onRefresh) onRefresh();
                              } catch (err) {
                                console.error('❌ Delete comment failed:', err);
                                if (err.response?.status === 401) {
                                  alert('Authentication failed. Please login again.');
                                } else {
                                  alert(`Failed to delete comment: ${err.response?.data?.message || 'Unknown error'}`);
                                }
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded-lg hover:bg-red-50"
                            title="Delete comment"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={handleAddComment} className="flex gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-indigo-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all shadow-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black text-sm hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg transform hover:scale-105 active:scale-95"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;
