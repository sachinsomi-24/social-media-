# Nexus — Social Media Application

A comprehensive full-stack social media application built with the **MERN stack** (MongoDB, Express.js, React, Node.js) and **Socket.io** for real-time chat.

## ✨ Features

- **🔐 User Authentication** — JWT-based secure login and registration
- **👤 Profile Management** — Edit profile, upload avatar & cover photos
- **📝 Posts & Feed** — Create posts with images, like, and comment
- **💬 Real-Time Chat** — Instant messaging with Socket.io
- **🔍 Explore & Search** — Discover users and posts
- **👥 Follow System** — Follow/unfollow users, personalized feed
- **📱 Responsive Design** — Works on desktop, tablet, and mobile
- **🎨 Premium Dark UI** — Glassmorphism design with animations

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite) |
| Styling | Vanilla CSS (Dark Glassmorphism) |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Real-Time | Socket.io |
| File Upload | Multer |

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
# Edit .env with your MongoDB URI
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables (backend/.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social-media-app
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

## 📂 Project Structure

```
social media/
├── backend/          # Express API + Socket.io
│   ├── config/       # Database connection
│   ├── controllers/  # Route handlers
│   ├── middleware/    # Auth, upload, error handling
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── socket/       # Socket.io handlers
│   └── server.js     # Entry point
│
├── frontend/         # React SPA
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── context/      # Auth & Socket context
│       ├── pages/        # Page components
│       ├── services/     # API service
│       ├── styles/       # CSS modules
│       └── utils/        # Helpers
│
└── README.md
```

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login user
- `GET /api/auth/me` — Get current user

### Users
- `GET /api/users/:id` — Get profile
- `PUT /api/users/:id` — Update profile
- `PUT /api/users/:id/follow` — Follow/unfollow
- `GET /api/users/search?q=` — Search users
- `GET /api/users/suggestions` — Get suggestions

### Posts
- `POST /api/posts` — Create post
- `GET /api/posts/feed` — Get feed
- `GET /api/posts/explore` — Explore posts
- `PUT /api/posts/:id/like` — Like/unlike
- `DELETE /api/posts/:id` — Delete post

### Comments
- `POST /api/comments/:postId` — Add comment
- `GET /api/comments/:postId` — Get comments

### Chat
- `POST /api/chat` — Create chat
- `GET /api/chat` — Get user chats
- `GET /api/chat/:chatId/messages` — Get messages
- `POST /api/chat/:chatId/messages` — Send message
