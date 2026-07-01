import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostForm from '../components/posts/PostForm';
import PostCard from '../components/posts/PostCard';
import { getImageUrl, getInitials } from '../utils/helpers';
import '../styles/feed.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchFeed();
    fetchSuggestions();
  }, []);

  const fetchFeed = async () => {
    try {
      const { data } = await postAPI.getFeed(1);
      setPosts(data.posts);
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const { data } = await userAPI.getSuggestions();
      setSuggestions(data.users);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    try {
      const { data } = await postAPI.getFeed(nextPage);
      setPosts(prev => [...prev, ...data.posts]);
      setPage(nextPage);
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch (error) {
      console.error('Error loading more:', error);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  const handleFollow = async (userId) => {
    try {
      await userAPI.followUser(userId);
      setSuggestions(prev => prev.filter(u => u._id !== userId));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="content-container" style={{ flex: 1 }}>
        <PostForm onPostCreated={handlePostCreated} />

        {loading ? (
          <div className="loader-container">
            <div className="loader" />
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No posts yet</h3>
            <p>Follow people or create your first post to see content here!</p>
          </div>
        ) : (
          <div className="stagger-children">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
            ))}
            {hasMore && (
              <button
                className="btn btn-secondary btn-block"
                onClick={loadMore}
                style={{ marginTop: '8px' }}
              >
                Load More
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right sidebar - suggestions */}
      <div className="right-sidebar" style={{ width: '300px', flexShrink: 0 }}>
        <div className="right-sidebar-card">
          <h3 className="right-sidebar-title">Suggested for you</h3>
          {suggestions.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.88rem' }}>
              No suggestions right now
            </p>
          ) : (
            suggestions.map((suggestedUser) => (
              <div key={suggestedUser._id} className="user-card" style={{ justifyContent: 'space-between' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1, minWidth: 0 }}
                  onClick={() => navigate(`/profile/${suggestedUser._id}`)}
                >
                  {suggestedUser.profilePicture ? (
                    <img src={getImageUrl(suggestedUser.profilePicture)} alt="" className="avatar avatar-sm" />
                  ) : (
                    <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
                      {getInitials(suggestedUser.fullName)}
                    </div>
                  )}
                  <div className="user-card-info">
                    <div className="user-card-name">{suggestedUser.fullName}</div>
                    <div className="user-card-username">@{suggestedUser.username}</div>
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-follow"
                  onClick={() => handleFollow(suggestedUser._id)}
                >
                  Follow
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
