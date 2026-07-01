const router = require('express').Router();
const {
  createPost,
  getFeed,
  getExplorePosts,
  getPost,
  getUserPosts,
  likePost,
  deletePost
} = require('../controllers/postController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, upload.single('image'), createPost);
router.get('/feed', auth, getFeed);
router.get('/explore', auth, getExplorePosts);
router.get('/user/:userId', auth, getUserPosts);
router.get('/:id', auth, getPost);
router.put('/:id/like', auth, likePost);
router.delete('/:id', auth, deletePost);

module.exports = router;
