import { useState, useRef } from 'react';
import { FiImage, FiSend, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { postAPI } from '../../services/api';
import { getImageUrl, getInitials } from '../../utils/helpers';
import '../../styles/feed.css';

const PostForm = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) formData.append('image', image);

      const { data } = await postAPI.createPost(formData);
      setContent('');
      removeImage();
      if (onPostCreated) onPostCreated(data.post);
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.2)',
            borderRadius: 'var(--border-radius-md)',
            color: 'var(--accent-danger)',
            fontSize: '0.88rem',
            marginBottom: '16px',
            animation: 'fadeIn 0.3s ease'
          }}>
            {error}
          </div>
        )}
        <div className="create-post-input-area">
          {user?.profilePicture ? (
            <img src={getImageUrl(user.profilePicture)} alt="" className="avatar avatar-md" />
          ) : (
            <div className="avatar-placeholder avatar-md" style={{ width: 44, height: 44, fontSize: '0.9rem' }}>
              {getInitials(user?.fullName)}
            </div>
          )}
          <textarea
            className="create-post-input"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={1}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
        </div>

        {imagePreview && (
          <div className="create-post-preview">
            <img src={imagePreview} alt="Preview" />
            <button type="button" className="create-post-preview-remove" onClick={removeImage}>
              <FiX />
            </button>
          </div>
        )}

        <div className="create-post-actions">
          <div className="create-post-options">
            <button
              type="button"
              className="create-post-option-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <FiImage className="option-icon" style={{ color: 'var(--accent-success)' }} />
              <span>Photo</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              hidden
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={loading || (!content.trim() && !image)}
          >
            {loading ? (
              <div className="loader loader-sm" style={{ borderTopColor: 'white' }} />
            ) : (
              <>
                <FiSend /> Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
