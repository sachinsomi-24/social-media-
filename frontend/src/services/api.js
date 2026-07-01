import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==========================================
// AUTH API
// ==========================================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// ==========================================
// USER API
// ==========================================
export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, data) => {
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    };
    return api.put(`/users/${id}`, data, config);
  },
  followUser: (id) => api.put(`/users/${id}/follow`),
  getFollowers: (id) => api.get(`/users/${id}/followers`),
  getFollowing: (id) => api.get(`/users/${id}/following`),
  searchUsers: (query) => api.get(`/users/search?q=${query}`),
  getSuggestions: () => api.get('/users/suggestions')
};

// ==========================================
// POST API
// ==========================================
export const postAPI = {
  createPost: (data) => {
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    };
    return api.post('/posts', data, config);
  },
  getFeed: (page = 1) => api.get(`/posts/feed?page=${page}`),
  getExplorePosts: (page = 1) => api.get(`/posts/explore?page=${page}`),
  getPost: (id) => api.get(`/posts/${id}`),
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
  likePost: (id) => api.put(`/posts/${id}/like`),
  deletePost: (id) => api.delete(`/posts/${id}`)
};

// ==========================================
// COMMENT API
// ==========================================
export const commentAPI = {
  addComment: (postId, data) => api.post(`/comments/${postId}`, data),
  getComments: (postId) => api.get(`/comments/${postId}`),
  deleteComment: (id) => api.delete(`/comments/${id}`)
};

// ==========================================
// CHAT API
// ==========================================
export const chatAPI = {
  createChat: (receiverId) => api.post('/chat', { receiverId }),
  getUserChats: () => api.get('/chat'),
  getMessages: (chatId, page = 1) => api.get(`/chat/${chatId}/messages?page=${page}`),
  sendMessage: (chatId, text) => api.post(`/chat/${chatId}/messages`, { text })
};

export default api;
