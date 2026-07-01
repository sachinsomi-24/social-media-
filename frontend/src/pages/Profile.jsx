import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiCamera, FiMessageCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { userAPI, postAPI, chatAPI } from '../services/api';
import PostCard from '../components/posts/PostCard';
import { getImageUrl, getInitials } from '../utils/helpers';
import '../styles/profile.css';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', bio: '' });
  const [editLoading, setEditLoading] = useState(false);

  const profilePicRef = useRef(null);
  const coverPicRef = useRef(null);

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const { data } = await userAPI.getProfile(id);
      setProfileUser(data.user);
      setIsFollowing(data.user.followers?.some(f => f._id === currentUser?._id));
      setFollowersCount(data.user.followers?.length || 0);
      setFollowingCount(data.user.following?.length || 0);
      setEditForm({
        fullName: data.user.fullName || '',
        bio: data.user.bio || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data } = await postAPI.getUserPosts(id);
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const { data } = await userAPI.followUser(id);
      setIsFollowing(data.following);
      setFollowersCount(prev => data.following ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleStartChat = async () => {
    try {
      const { data } = await chatAPI.createChat(id);
      navigate('/chat', { state: { selectedChat: data.chat } });
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', editForm.fullName);
      formData.append('bio', editForm.bio);

      const { data } = await userAPI.updateProfile(id, formData);
      setProfileUser(data.user);
      updateUser(data.user);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleImageUpload = async (type, file) => {
    const formData = new FormData();
    formData.append(type, file);

    try {
      const { data } = await userAPI.updateProfile(id, formData);
      setProfileUser(data.user);
      if (isOwnProfile) updateUser(data.user);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  if (loading) {
    return (
      <div className="loader-container" style={{ minHeight: '60vh' }}>
        <div className="loader loader-lg" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <h3>User not found</h3>
        <p>The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Cover Photo */}
      <div className="profile-cover">
        {profileUser.coverPicture ? (
          <img src={getImageUrl(profileUser.coverPicture)} alt="Cover" />
        ) : (
          <div className="profile-cover-placeholder" />
        )}
        {isOwnProfile && (
          <>
            <button className="profile-cover-edit" onClick={() => coverPicRef.current?.click()}>
              <FiCamera /> Edit Cover
            </button>
            <input
              type="file"
              ref={coverPicRef}
              hidden
              accept="image/*"
              onChange={(e) => e.target.files[0] && handleImageUpload('coverPicture', e.target.files[0])}
            />
          </>
        )}
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-container">
          {profileUser.profilePicture ? (
            <img src={getImageUrl(profileUser.profilePicture)} alt="" className="avatar avatar-2xl" />
          ) : (
            <div className="avatar-placeholder avatar-2xl" style={{ width: 140, height: 140, fontSize: '2.5rem' }}>
              {getInitials(profileUser.fullName)}
            </div>
          )}
          {isOwnProfile && (
            <>
              <button className="profile-avatar-edit" onClick={() => profilePicRef.current?.click()}>
                <FiCamera />
              </button>
              <input
                type="file"
                ref={profilePicRef}
                hidden
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleImageUpload('profilePicture', e.target.files[0])}
              />
            </>
          )}
        </div>

        <div className="profile-info">
          <div>
            <h1 className="profile-name">{profileUser.fullName}</h1>
            <p className="profile-username">@{profileUser.username}</p>
            {profileUser.bio && <p className="profile-bio">{profileUser.bio}</p>}

            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-value">{posts.length}</span>
                <span className="profile-stat-label">Posts</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{followersCount}</span>
                <span className="profile-stat-label">Followers</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{followingCount}</span>
                <span className="profile-stat-label">Following</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            {isOwnProfile ? (
              <button className="btn btn-secondary" onClick={() => setShowEditModal(true)}>
                <FiEdit2 /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
                <button className="btn btn-secondary" onClick={handleStartChat}>
                  <FiMessageCircle /> Message
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-secondary)' }}>
          Posts
        </h2>
        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No posts yet</h3>
            <p>{isOwnProfile ? 'Share your first post!' : `${profileUser.fullName} hasn't posted yet.`}</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
          ))
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button className="btn-icon" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="modal-body">
                <div className="edit-profile-form">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Bio</label>
                    <textarea
                      className="input-field"
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      maxLength={160}
                      rows={3}
                    />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                      {editForm.bio.length}/160
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? <div className="loader loader-sm" style={{ borderTopColor: 'white' }} /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
