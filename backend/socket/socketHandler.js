const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

const onlineUsers = new Map();

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // User comes online
    socket.on('user-online', async (userId) => {
      onlineUsers.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit('user-status', { userId, isOnline: true });
      console.log(`✅ User ${userId} is online`);
    });

    // Join a chat room
    socket.on('join-chat', (chatId) => {
      socket.join(chatId);
      console.log(`👥 User joined chat: ${chatId}`);
    });

    // Leave a chat room
    socket.on('leave-chat', (chatId) => {
      socket.leave(chatId);
    });

    // Send a message
    socket.on('send-message', async (data) => {
      try {
        const { chatId, senderId, text } = data;

        // Save message to database
        const message = await Message.create({
          chatId,
          sender: senderId,
          text
        });

        await message.populate('sender', 'username fullName profilePicture');

        // Update chat's last message
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: text
        });

        // Emit to all users in the chat room
        io.to(chatId).emit('receive-message', message);

        // Notify other participants who may not be in the chat room
        const chat = await Chat.findById(chatId);
        chat.participants.forEach((participantId) => {
          const participantStr = participantId.toString();
          if (participantStr !== senderId) {
            const recipientSocket = onlineUsers.get(participantStr);
            if (recipientSocket) {
              io.to(recipientSocket).emit('new-message-notification', {
                chatId,
                message
              });
            }
          }
        });
      } catch (error) {
        console.error('Socket send-message error:', error);
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(data.chatId).emit('user-typing', {
        userId: data.userId,
        username: data.username,
        isTyping: true
      });
    });

    // Stop typing indicator
    socket.on('stop-typing', (data) => {
      socket.to(data.chatId).emit('user-typing', {
        userId: data.userId,
        username: data.username,
        isTyping: false
      });
    });

    // User disconnects
    socket.on('disconnect', async () => {
      let disconnectedUserId = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        await User.findByIdAndUpdate(disconnectedUserId, { isOnline: false });
        io.emit('user-status', { userId: disconnectedUserId, isOnline: false });
        console.log(`❌ User ${disconnectedUserId} disconnected`);
      }
    });
  });
};

module.exports = { setupSocket };
