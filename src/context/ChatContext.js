import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../api/client';
import { toast } from 'react-toastify';
import { useUser } from '@clerk/clerk-react';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, isSignedIn } = useUser();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const typingTimeoutRef = useRef({});

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!isSignedIn || !user) return;

    // Only connect to socket if backend is enabled
    const backendEnabled = process.env.REACT_APP_ENABLE_CHAT_BACKEND === 'true';
    if (!backendEnabled) {
      console.log('[Chat] Backend disabled - running in offline mode');
      return;
    }

    const serverUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      // Join with user identity
      const role = user.publicMetadata?.role || 'user';
      newSocket.emit('join', {
        userId: user.id,
        printerShopId: role === 'printer' ? user.id : null,
        role
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for new messages
    newSocket.on('new_message', (message) => {
      setMessages(prev => ({
        ...prev,
        [message.conversationId]: [...(prev[message.conversationId] || []), message]
      }));

      // Update conversation's last message time
      setConversations(prev =>
        prev.map(conv =>
          conv.id === message.conversationId
            ? { ...conv, lastMessageAt: message.createdAt, unreadCount: conv.unreadCount + 1 }
            : conv
        ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    });

    // Listen for message notifications
    newSocket.on('new_message_notification', ({ conversationId, message }) => {
      // Show notification if not in active conversation
      if (activeConversation?.id !== conversationId) {
        toast.info('New message received');
      }
    });

    // Listen for typing indicators
    newSocket.on('user_typing', ({ conversationId, isTyping }) => {
      setTypingUsers(prev => ({
        ...prev,
        [conversationId]: isTyping
      }));
    });

    // Listen for read receipts
    newSocket.on('messages_read', ({ conversationId }) => {
      setMessages(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map(msg => ({
          ...msg,
          readStatus: 1
        }))
      }));
    });

    // Listen for online/offline status
    newSocket.on('user_online', ({ identity }) => {
      setOnlineUsers(prev => new Set([...prev, identity]));
    });

    newSocket.on('user_offline', ({ identity }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(identity);
        return newSet;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isSignedIn, user, activeConversation?.id]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;

    // Don't attempt to load if backend is disabled
    const backendEnabled = process.env.REACT_APP_ENABLE_CHAT_BACKEND === 'true';
    if (!backendEnabled) {
      console.log('[Chat] Backend disabled - skipping conversation load');
      setConversations([]);
      return;
    }

    setLoading(true);
    try {
      const role = user.publicMetadata?.role || 'user';
      const endpoint = role === 'user'
        ? `/api/chat/conversations/user/${user.id}`
        : `/api/chat/conversations/printer/${user.id}`;

      const response = await api.get(endpoint);
      setConversations(response.data.conversations || []);
    } catch (error) {
      // Fail silently - don't show toast errors during initialization
      console.warn('[Chat] Could not load conversations (backend may be offline):', error.message);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create or get conversation
  const getOrCreateConversation = useCallback(async (printerShopId) => {
    if (!user) return null;

    // Don't attempt to create if backend is disabled
    const backendEnabled = process.env.REACT_APP_ENABLE_CHAT_BACKEND === 'true';
    if (!backendEnabled) {
      console.warn('[Chat] Cannot create conversation - backend is disabled');
      return null;
    }

    try {
      const response = await api.post('/api/chat/conversations', {
        userId: user.id,
        printerShopId
      });

      const conversation = response.data.conversation;

      // Add to conversations if not already present
      setConversations(prev => {
        const exists = prev.find(c => c.id === conversation.id);
        if (exists) return prev;
        return [conversation, ...prev];
      });

      return conversation;
    } catch (error) {
      console.warn('[Chat] Could not create conversation (backend may be offline):', error.message);
      return null;
    }
  }, [user]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId, offset = 0, limit = 50) => {
    if (!user) return;

    // Don't attempt to load if backend is disabled
    const backendEnabled = process.env.REACT_APP_ENABLE_CHAT_BACKEND === 'true';
    if (!backendEnabled) {
      return { messages: [], hasMore: false };
    }

    try {
      const userRole = user.publicMetadata?.role || 'user';
      const role = userRole === 'admin' ? 'printer' : userRole;
      const params = {
        [role === 'user' ? 'userId' : 'printerShopId']: user.id,
        offset,
        limit
      };

      const response = await api.get(`/api/chat/conversations/${conversationId}/messages`, { params });

      setMessages(prev => ({
        ...prev,
        [conversationId]: response.data.messages || []
      }));

      return response.data;
    } catch (error) {
      console.warn('[Chat] Could not load messages (backend may be offline):', error.message);
      return { messages: [], hasMore: false };
    }
  }, [user]);

  // Send message via Socket.IO
  const sendMessage = useCallback((conversationId, message) => {
    if (!socket || !user) return;

    const userRole = user.publicMetadata?.role || 'user';
    const role = userRole === 'admin' ? 'printer' : userRole;

    socket.emit('send_message', {
      conversationId,
      senderId: user.id,
      senderRole: role,
      message
    });

    // Optimistically add message to UI
    const tempMessage = {
      id: `temp_${Date.now()}`,
      conversationId,
      senderId: user.id,
      senderRole: role,
      message,
      createdAt: new Date().toISOString(),
      readStatus: 0
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), tempMessage]
    }));
  }, [socket, user]);

  // Join conversation room
  const joinConversation = useCallback((conversationId) => {
    if (!socket) return;
    socket.emit('join_conversation', { conversationId });
    setActiveConversation(conversations.find(c => c.id === conversationId) || { id: conversationId });

    // Mark messages as read
    markMessagesAsRead(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, conversations]);

  // Leave conversation room
  const leaveConversation = useCallback(() => {
    setActiveConversation(null);
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((conversationId, isTyping) => {
    if (!socket || !user) return;

    const userRole = user.publicMetadata?.role || 'user';
    const role = userRole === 'admin' ? 'printer' : userRole;

    // Clear existing timeout
    if (typingTimeoutRef.current[conversationId]) {
      clearTimeout(typingTimeoutRef.current[conversationId]);
    }

    socket.emit('typing', {
      conversationId,
      userId: role === 'user' ? user.id : null,
      printerShopId: role === 'printer' ? user.id : null,
      isTyping
    });

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      typingTimeoutRef.current[conversationId] = setTimeout(() => {
        socket.emit('typing', {
          conversationId,
          userId: role === 'user' ? user.id : null,
          printerShopId: role === 'printer' ? user.id : null,
          isTyping: false
        });
      }, 3000);
    }
  }, [socket, user]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (conversationId) => {
    if (!socket || !user) return;

    const userRole = user.publicMetadata?.role || 'user';
    const role = userRole === 'admin' ? 'printer' : userRole;

    socket.emit('mark_read', {
      conversationId,
      userId: role === 'user' ? user.id : null,
      printerShopId: role === 'printer' ? user.id : null
    });

    // Also call API to ensure persistence
    try {
      await api.patch('/api/chat/messages/read', {
        conversationId,
        userId: role === 'user' ? user.id : null,
        printerShopId: role === 'printer' ? user.id : null
      });

      // Update local state
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [socket, user]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    if (!user) return;

    // Don't attempt to load if backend is disabled
    const backendEnabled = process.env.REACT_APP_ENABLE_CHAT_BACKEND === 'true';
    if (!backendEnabled) {
      setUnreadCount(0);
      return;
    }

    try {
      const userRole = user.publicMetadata?.role || 'user';
      const role = userRole === 'admin' ? 'printer' : userRole;
      const params = {
        [role === 'user' ? 'userId' : 'printerShopId']: user.id
      };

      const response = await api.get('/api/chat/messages/unread', { params });
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.warn('[Chat] Could not load unread count (backend may be offline):', error.message);
      setUnreadCount(0);
    }
  }, [user]);

  // Load conversations on mount
  useEffect(() => {
    if (isSignedIn && user) {
      loadConversations();
      loadUnreadCount();
    }
  }, [isSignedIn, user, loadConversations, loadUnreadCount]);

  const value = {
    socket,
    conversations,
    activeConversation,
    messages,
    onlineUsers,
    typingUsers,
    unreadCount,
    loading,
    loadConversations,
    getOrCreateConversation,
    loadMessages,
    sendMessage,
    joinConversation,
    leaveConversation,
    sendTyping,
    markMessagesAsRead,
    loadUnreadCount
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
