import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiMessageCircle, FiBell, FiLogOut, FiMenu } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { getImageUrl, getInitials } from '../../utils/helpers';
import '../../styles/layout.css';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      try {
        const { data } = await userAPI.searchUsers(query);
        setSearchResults(data.users);
        setShowSearch(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };

  const handleUserClick = (userId) => {
    setShowSearch(false);
    setSearchQuery('');
    navigate(`/profile/${userId}`);
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="navbar-menu-toggle" onClick={onToggleSidebar}>
          <FiMenu />
        </button>
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-icon">◆</div>
          Nexus
        </Link>
      </div>

      <div className="navbar-search">
        <FiSearch className="navbar-search-icon" />
        <input
          type="text"
          placeholder="Search people..."
          value={searchQuery}
          onChange={handleSearch}
          onFocus={() => searchResults.length > 0 && setShowSearch(true)}
          onBlur={() => setTimeout(() => setShowSearch(false), 200)}
        />
        {showSearch && searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
            maxHeight: '320px',
            overflowY: 'auto'
          }}>
            {searchResults.map(u => (
              <div
                key={u._id}
                className="user-card"
                onClick={() => handleUserClick(u._id)}
              >
                {u.profilePicture ? (
                  <img src={getImageUrl(u.profilePicture)} alt="" className="avatar avatar-sm" />
                ) : (
                  <div className="avatar-placeholder avatar-sm" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
                    {getInitials(u.fullName)}
                  </div>
                )}
                <div className="user-card-info">
                  <div className="user-card-name">{u.fullName}</div>
                  <div className="user-card-username">@{u.username}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="navbar-actions">
        <Link to="/chat">
          <button className="btn-icon navbar-notification">
            <FiMessageCircle />
          </button>
        </Link>
        <button className="btn-icon">
          <FiBell />
        </button>

        <div style={{ position: 'relative' }}>
          <div className="navbar-user" onClick={() => setShowUserMenu(!showUserMenu)}>
            {user?.profilePicture ? (
              <img src={getImageUrl(user.profilePicture)} alt="" className="avatar avatar-sm" />
            ) : (
              <div className="avatar-placeholder avatar-sm" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
                {getInitials(user?.fullName)}
              </div>
            )}
            <span className="navbar-user-name">{user?.fullName?.split(' ')[0]}</span>
          </div>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-md)',
              boxShadow: 'var(--shadow-lg)',
              minWidth: '180px',
              zIndex: 100,
              animation: 'scaleIn 0.2s ease'
            }}>
              <div
                className="user-card"
                onClick={() => { setShowUserMenu(false); navigate(`/profile/${user._id}`); }}
              >
                <span>👤</span>
                <span>My Profile</span>
              </div>
              <div style={{ height: 1, background: 'var(--border-color)' }} />
              <div
                className="user-card"
                onClick={() => { setShowUserMenu(false); logout(); navigate('/login'); }}
                style={{ color: 'var(--accent-danger)' }}
              >
                <FiLogOut />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
