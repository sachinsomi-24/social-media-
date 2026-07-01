const router = require('express').Router();
const {
  getUserProfile,
  updateProfile,
  followUser,
  getFollowers,
  getFollowing,
  searchUsers,
  getSuggestions
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Search & suggestions must be before /:id to avoid conflict
router.get('/search', auth, searchUsers);
router.get('/suggestions', auth, getSuggestions);

router.get('/:id', auth, getUserProfile);
router.put('/:id', auth, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'coverPicture', maxCount: 1 }
]), updateProfile);
router.put('/:id/follow', auth, followUser);
router.get('/:id/followers', auth, getFollowers);
router.get('/:id/following', auth, getFollowing);

module.exports = router;
