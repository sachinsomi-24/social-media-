const Chat = require('../models/Chat');
const Message = require('../models/Message');

// @desc    Create or get existing chat between two users
// @route   POST /api/chat
exports.createChat = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] }
    }).populate('participants', 'username fullName profilePicture isOnline');

    if (chat) {
      return res.json({ success: true, chat });
    }

    // Create new chat
    chat = await Chat.create({
      participants: [senderId, receiverId]
    });

    await chat.populate('participants', 'username fullName profilePicture isOnline');

    res.status(201).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's chat list
// @route   GET /api/chat
exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $in: [req.user._id] }
    })
    .populate('participants', 'username fullName profilePicture isOnline')
    .sort({ updatedAt: -1 });

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get messages for a chat
// @route   GET /api/chat/:chatId/messages
exports.getMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('sender', 'username fullName profilePicture')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/chat/:chatId/messages
exports.sendMessage = async (req, res) => {
  try {
    const message = await Message.create({
      chatId: req.params.chatId,
      sender: req.user._id,
      text: req.body.text
    });

    // Update chat's last message
    await Chat.findByIdAndUpdate(req.params.chatId, {
      lastMessage: req.body.text
    });

    await message.populate('sender', 'username fullName profilePicture');

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
