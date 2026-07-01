const router = require('express').Router();
const {
  createChat,
  getUserChats,
  getMessages,
  sendMessage
} = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.post('/', auth, createChat);
router.get('/', auth, getUserChats);
router.get('/:chatId/messages', auth, getMessages);
router.post('/:chatId/messages', auth, sendMessage);

module.exports = router;
