const User = require('../models/User');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username fullName profilePicture')
      .populate('following', 'username fullName profilePicture');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
exports.updateProfile = async (req, res) => {
  try {
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    const allowedUpdates = ['fullName', 'bio', 'profilePicture', 'coverPicture'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle file uploads
    if (req.files) {
      if (req.files.profilePicture) {
        updates.profilePicture = `/uploads/${req.files.profilePicture[0].filename}`;
      }
      if (req.files.coverPicture) {
        updates.coverPicture = `/uploads/${req.files.coverPicture[0].filename}`;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Follow / Unfollow a user
// @route   PUT /api/users/:id/follow
exports.followUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { following: req.params.id }
      });
      await User.findByIdAndUpdate(req.params.id, {
        $pull: { followers: req.user._id }
      });

      res.json({ success: true, message: 'User unfollowed', following: false });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.user._id, {
        $push: { following: req.params.id }
      });
      await User.findByIdAndUpdate(req.params.id, {
        $push: { followers: req.user._id }
      });

      res.json({ success: true, message: 'User followed', following: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username fullName profilePicture bio');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ success: true, followers: user.followers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's following
// @route   GET /api/users/:id/following
exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username fullName profilePicture bio');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ success: true, following: user.following });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search users
// @route   GET /api/users/search?q=query
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } }
      ]
    })
    .select('username fullName profilePicture bio')
    .limit(20);

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get suggested users (users not followed)
// @route   GET /api/users/suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const suggestions = await User.find({
      _id: { $nin: [...currentUser.following, req.user._id] }
    })
    .select('username fullName profilePicture bio')
    .limit(5);

    res.json({ success: true, users: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
