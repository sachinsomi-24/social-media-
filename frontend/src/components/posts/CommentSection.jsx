import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { commentAPI } from '../../services/api';
import { getImageUrl, getInitials, formatDate } from '../../utils/helpers';

const CommentSection = ({ postId, onCommentCountChange }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data } = await commentAPI.getComments(postId);
      setComments(data.comments);
      if (onCommentCountChange) onCommentCountChange(data.comments.length);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await commentAPI.addComment(postId, { text: newComment });
      setComments([data.comment, ...comments]);
      setNewComment('');
      if (onCommentCountChange) onCommentCountChange(comments.length + 1);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await commentAPI.deleteComment(commentId);
      const updated = comments.filter(c => c._id !== commentId);
      setComments(updated);
      if (onCommentCountChange) onCommentCountChange(updated.length);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="comments-section" style={{ padding: '20px 0' }}>
        <div className="loader-container" style={{ padding: '16px' }}>
          <div className="loader loader-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="comments-section">
      <form onSubmit={handleSubmit} className="comment-input-area">
        {user?.profilePicture ? (
          <img src={getImageUrl(user.profilePicture)} alt="" className="avatar avatar-sm" />
        ) : (
          <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
            {getInitials(user?.fullName)}
          </div>
        )}
        <input
          type="text"
          className="comment-input"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          className="comment-submit-btn"
          disabled={!newComment.trim() || submitting}
        >
          <FiSend />
        </button>
      </form>

      {comments.map((comment) => (
        <div key={comment._id} className="comment-item">
          {comment.userId?.profilePicture ? (
            <img
              src={getImageUrl(comment.userId.profilePicture)}
              alt=""
              className="avatar avatar-sm"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${comment.userId._id}`)}
            />
          ) : (
            <div
              className="avatar-placeholder"
              style={{ width: 32, height: 32, fontSize: '0.7rem', cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${comment.userId._id}`)}
            >
              {getInitials(comment.userId?.fullName)}
            </div>
          )}
          <div className="comment-body">
            <span
              className="comment-user"
              onClick={() => navigate(`/profile/${comment.userId._id}`)}
            >
              {comment.userId?.fullName}
            </span>
            <p className="comment-text">{comment.text}</p>
            <div className="comment-meta">
              <span>{formatDate(comment.createdAt)}</span>
              {comment.userId?._id === user?._id && (
                <button
                  onClick={() => handleDelete(comment._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-danger)',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FiTrash2 size={12} /> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {comments.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.88rem', padding: '16px 0' }}>
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
};

export default CommentSection;
