import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FiSend, FiArrowLeft, FiMessageCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatAPI } from '../services/api';
import { getImageUrl, getInitials, formatMessageTime, formatDate } from '../utils/helpers';
import '../styles/chat.css';

const Chat = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const location = useLocation();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(null);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, []);

  // Handle pre-selected chat from profile page
  useEffect(() => {
    if (location.state?.selectedChat) {
      handleSelectChat(location.state.selectedChat);
    }
  }, [location.state]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('receive-message', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    socket.on('user-typing', ({ username, isTyping }) => {
      setTyping(isTyping ? username : null);
    });

    socket.on('new-message-notification', ({ chatId, message }) => {
      setChats(prev => prev.map(chat =>
        chat._id === chatId ? { ...chat, lastMessage: message.text, updatedAt: new Date().toISOString() } : chat
      ));
    });

    return () => {
      socket.off('receive-message');
      socket.off('user-typing');
      socket.off('new-message-notification');
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const fetchChats = async () => {
    try {
      const { data } = await chatAPI.getUserChats();
      setChats(data.chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    setMobileChatOpen(true);

    // Leave previous chat room and join new one
    if (selectedChat) {
      socket?.emit('leave-chat', selectedChat._id);
    }
    socket?.emit('join-chat', chat._id);

    try {
      const { data } = await chatAPI.getMessages(chat._id);
      setMessages(data.messages);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const text = newMessage;
    setNewMessage('');

    // Send via socket for real-time
    socket?.emit('send-message', {
      chatId: selectedChat._id,
      senderId: user._id,
      text
    });

    // Stop typing indicator
    socket?.emit('stop-typing', {
      chatId: selectedChat._id,
      userId: user._id,
      username: user.fullName
    });

    // Update chat list
    setChats(prev => prev.map(chat =>
      chat._id === selectedChat._id ? { ...chat, lastMessage: text, updatedAt: new Date().toISOString() } : chat
    ));
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (selectedChat && socket) {
      socket.emit('typing', {
        chatId: selectedChat._id,
        userId: user._id,
        username: user.fullName
      });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop-typing', {
          chatId: selectedChat._id,
          userId: user._id,
          username: user.fullName
        });
      }, 2000);
    }
  };

  const getChatPartner = (chat) => {
    return chat.participants?.find(p => p._id !== user._id);
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  return (
    <div className="chat-page">
      {/* Chat List */}
      <div className={`chat-list-panel ${mobileChatOpen ? 'hidden' : ''}`}>
        <div className="chat-list-header">
          <h2>Messages</h2>
        </div>

        <div className="chat-conversations">
          {loading ? (
            <div className="loader-container">
              <div className="loader" />
            </div>
          ) : chats.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-icon">💬</div>
              <h3>No messages yet</h3>
              <p>Start a conversation from someone's profile!</p>
            </div>
          ) : (
            chats.map((chat) => {
              const partner = getChatPartner(chat);
              if (!partner) return null;
              return (
                <div
                  key={chat._id}
                  className={`chat-conversation-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className={isUserOnline(partner._id) ? 'avatar-online' : ''}>
                    {partner.profilePicture ? (
                      <img src={getImageUrl(partner.profilePicture)} alt="" className="avatar avatar-md" />
                    ) : (
                      <div className="avatar-placeholder avatar-md" style={{ width: 44, height: 44, fontSize: '0.9rem' }}>
                        {getInitials(partner.fullName)}
                      </div>
                    )}
                  </div>
                  <div className="chat-conversation-info">
                    <div className="chat-conversation-name">{partner.fullName}</div>
                    <div className="chat-conversation-last">{chat.lastMessage || 'Start chatting...'}</div>
                  </div>
                  <span className="chat-conversation-time">{formatDate(chat.updatedAt)}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat ? (
        <div className={`chat-window ${!mobileChatOpen ? 'hidden' : ''}`}>
          <div className="chat-window-header">
            <button
              className="btn-icon"
              onClick={() => setMobileChatOpen(false)}
              style={{ display: 'none' }}
              id="chat-back-btn"
            >
              <FiArrowLeft />
            </button>
            {(() => {
              const partner = getChatPartner(selectedChat);
              return (
                <>
                  {partner?.profilePicture ? (
                    <img src={getImageUrl(partner.profilePicture)} alt="" className="avatar avatar-md" />
                  ) : (
                    <div className="avatar-placeholder avatar-md" style={{ width: 44, height: 44, fontSize: '0.9rem' }}>
                      {getInitials(partner?.fullName)}
                    </div>
                  )}
                  <div className="chat-window-user-info">
                    <div className="chat-window-user-name">{partner?.fullName}</div>
                    <div className={`chat-window-user-status ${isUserOnline(partner?._id) ? 'online' : ''}`}>
                      {isUserOnline(partner?._id) ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={msg._id || index}
                className={`message-bubble ${msg.sender?._id === user._id || msg.sender === user._id ? 'sent' : 'received'}`}
              >
                <p>{msg.text}</p>
                <span className="message-time">{formatMessageTime(msg.createdAt)}</span>
              </div>
            ))}
            {typing && (
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
                <span>{typing} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="chat-input"
              placeholder="Type a message..."
              value={newMessage}
              onChange={handleTyping}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!newMessage.trim()}
            >
              <FiSend />
            </button>
          </form>
        </div>
      ) : (
        <div className="chat-window">
          <div className="chat-window-empty">
            <FiMessageCircle className="chat-window-empty-icon" />
            <h3>Select a conversation</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
              Choose a chat from the sidebar or start a new one from a user's profile
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
