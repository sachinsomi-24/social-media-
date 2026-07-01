import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { postAPI, userAPI } from '../services/api';
import PostCard from '../components/posts/PostCard';
import { getImageUrl, getInitials } from '../utils/helpers';

const Explore = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExplorePosts();
  }, []);

  const fetchExplorePosts = async () => {
    try {
      const { data } = await postAPI.getExplorePosts();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching explore posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      try {
        const { data } = await userAPI.searchUsers(query);
        setSearchResults(data.users);
        setActiveTab('people');
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setSearchResults([]);
      setActiveTab('posts');
    }
  };

  const handleFollow = async (userId) => {
    try {
      await userAPI.followUser(userId);
      setSearchResults(prev =>
        prev.map(u => u._id === userId ? { ...u, isFollowed: !u.isFollowed } : u)
      );
    } catch (error) {
      console.error('Error following:', error);
    }
  };

  return (
    <div className="content-container" style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>
          <span className="gradient-text">Explore</span>
        </h1>

        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <FiSearch style={{
            position: 'absolute', left: '16px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: '1.1rem'
          }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search for people..."
            value={searchQuery}
            onChange={handleSearch}
            style={{ paddingLeft: '44px', borderRadius: 'var(--border-radius-xl)' }}
          />
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button
            className={`profile-tab ${activeTab === 'people' ? 'active' : ''}`}
            onClick={() => setActiveTab('people')}
          >
            People
          </button>
        </div>
      </div>

      {activeTab === 'posts' ? (
        loading ? (
          <div className="loader-container">
            <div className="loader" />
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌍</div>
            <h3>Nothing to explore</h3>
            <p>Be the first to post something!</p>
          </div>
        ) : (
          <div className="stagger-children">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )
      ) : (
        searchResults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>Search for people</h3>
            <p>Find and connect with others</p>
          </div>
        ) : (
          <div className="stagger-children">
            {searchResults.map((u) => (
              <div key={u._id} className="glass-card" style={{ padding: '16px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/profile/${u._id}`)}
                  >
                    {u.profilePicture ? (
                      <img src={getImageUrl(u.profilePicture)} alt="" className="avatar avatar-lg" />
                    ) : (
                      <div className="avatar-placeholder avatar-lg" style={{ width: 64, height: 64, fontSize: '1.3rem' }}>
                        {getInitials(u.fullName)}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{ fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => navigate(`/profile/${u._id}`)}
                    >
                      {u.fullName}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>@{u.username}</p>
                    {u.bio && (
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {u.bio}
                      </p>
                    )}
                  </div>
                  <button className="btn btn-primary btn-follow" onClick={() => handleFollow(u._id)}>
                    Follow
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Explore;
