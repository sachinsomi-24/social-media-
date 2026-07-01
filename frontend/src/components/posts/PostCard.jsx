import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiTrash2, FiMoreHorizontal } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { postAPI } from '../../services/api';
import { getImageUrl, getInitials, formatDate } from '../../utils/helpers';
import CommentSection from './CommentSection';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);

  const handleLike = async () => {
    try {
      await postAPI.likePost(post._id);
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await postAPI.deletePost(post._id);
      if (onDelete) onDelete(post._id);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
    setShowMenu(false);
  };

  const postUser = post.userId;
  const isOwnPost = postUser?._id === user?._id;

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-user-info">
          {postUser?.profilePicture ? (
            <img
              src={getImageUrl(postUser.profilePicture)}
              alt=""
              className="avatar avatar-md"
              onClick={() => navigate(`/profile/${postUser._id}`)}
              style={{ cursor: 'pointer' }}
            />
          ) : (
            <div
              className="avatar-placeholder avatar-md"
              style={{ width: 44, height: 44, fontSize: '0.9rem', cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${postUser._id}`)}
            >
              {getInitials(postUser?.fullName)}
            </div>
          )}
          <div className="post-user-details">
            <span
              className="post-username"
              onClick={() => navigate(`/profile/${postUser._id}`)}
            >
              {postUser?.fullName}
            </span>
            <span className="post-time">@{postUser?.username} · {formatDate(post.createdAt)}</span>
          </div>
        </div>

        {isOwnPost && (
          <div style={{ position: 'relative' }}>
            <button className="post-menu-btn" onClick={() => setShowMenu(!showMenu)}>
              <FiMoreHorizontal />
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 10,
                animation: 'scaleIn 0.2s ease'
              }}>
                <button
                  onClick={handleDelete}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    color: 'var(--accent-danger)',
                    fontSize: '0.88rem',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <FiTrash2 /> Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="post-content">{post.content}</p>

      {post.image && (
        <img src={getImageUrl(post.image)} alt="Post" className="post-image" />
      )}

      {(likeCount > 0 || commentCount > 0) && (
        <div className="post-stats">
          {likeCount > 0 && <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>}
          {commentCount > 0 && (
            <span onClick={() => setShowComments(!showComments)}>
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </span>
          )}
        </div>
      )}

      <div className="post-actions">
        <button
          className={`post-action-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          {liked ? <FaHeart className="action-icon like-icon" /> : <FiHeart className="action-icon" />}
          <span>{liked ? 'Liked' : 'Like'}</span>
        </button>

        <button
          className="post-action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <FiMessageCircle className="action-icon" />
          <span>Comment</span>
        </button>
      </div>

      {showComments && (
        <CommentSection
          postId={post._id}
          onCommentCountChange={(count) => setCommentCount(count)}
        />
      )}
    </div>
  );
};

export default PostCard;
