# Chat Feature Implementation Guide

## Overview
This document explains the complete 1-to-1 chat system implementation for the Secure Print Link application, allowing users to chat with printer shop owners in a WhatsApp-style interface.

---

## Architecture

### 1. **Chat Identity Model**

#### Persistent Identifiers
- **userId**: Already exists in the system (from users table)
- **printerShopId**: Stable, unique identifier from printers table
- **conversationId**: Deterministic hash of userId + printerShopId

```javascript
// Conversation ID generation (deterministic)
function generateConversationId(userId, printerShopId) {
  const sortedIds = [userId, printerShopId].sort();
  return crypto
    .createHash('sha256')
    .update(sortedIds.join(':'))
    .digest('hex')
    .substring(0, 32);
}
```

#### Key Principle
- One conversation per user ↔ printer shop pair
- ConversationId is **deterministic** - same inputs always generate same ID
- No duplicate conversations possible due to UNIQUE constraint

---

## Database Schema

### Tables

#### 1. **conversations**
```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,                    -- SHA-256 hash(userId + printerShopId)
  userId TEXT NOT NULL,                   -- Foreign key to users
  printerShopId TEXT NOT NULL,            -- Foreign key to printers
  createdAt TEXT NOT NULL,                -- ISO 8601 timestamp
  updatedAt TEXT NOT NULL,                -- ISO 8601 timestamp
  lastMessageAt TEXT,                     -- Last message timestamp (nullable)
  UNIQUE(userId, printerShopId),          -- Prevent duplicates
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(printerShopId) REFERENCES printers(id) ON DELETE CASCADE
);
```

#### 2. **messages**
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,                    -- nanoid
  conversationId TEXT NOT NULL,           -- Links to conversation
  senderId TEXT NOT NULL,                 -- userId or printerShopId
  senderRole TEXT NOT NULL,               -- 'user' or 'printer'
  message TEXT NOT NULL,                  -- Message content
  createdAt TEXT NOT NULL,                -- ISO 8601 timestamp
  readStatus INTEGER DEFAULT 0,           -- 0 = unread, 1 = read
  FOREIGN KEY(conversationId) REFERENCES conversations(id) ON DELETE CASCADE
);
```

#### Performance Indexes
```sql
-- Conversation indexes
CREATE INDEX idx_conversations_userId ON conversations(userId);
CREATE INDEX idx_conversations_printerShopId ON conversations(printerShopId);
CREATE INDEX idx_conversations_lastMessageAt ON conversations(lastMessageAt);

-- Message indexes
CREATE INDEX idx_messages_conversationId ON messages(conversationId);
CREATE INDEX idx_messages_createdAt ON messages(createdAt);
CREATE INDEX idx_messages_readStatus ON messages(readStatus);
```

---

## API Endpoints

### REST API (`/api/chat`)

#### 1. **Create/Get Conversation**
```http
POST /api/chat/conversations
Content-Type: application/json

{
  "userId": "user123",
  "printerShopId": "printer456"
}

Response:
{
  "conversation": {
    "id": "abc123...",
    "userId": "user123",
    "printerShopId": "printer456",
    "createdAt": "2024-01-27T...",
    "updatedAt": "2024-01-27T..."
  }
}
```

#### 2. **Get User's Conversations**
```http
GET /api/chat/conversations/user/:userId

Response:
{
  "conversations": [
    {
      "id": "abc123...",
      "userId": "user123",
      "printerShopId": "printer456",
      "printerShopName": "FastPrint Shop",
      "printerShopLocation": "Downtown",
      "unreadCount": 3,
      "lastMessageAt": "2024-01-27T..."
    }
  ]
}
```

#### 3. **Get Printer Shop's Conversations**
```http
GET /api/chat/conversations/printer/:printerShopId

Response:
{
  "conversations": [
    {
      "id": "abc123...",
      "userId": "user123",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "unreadCount": 2,
      "lastMessageAt": "2024-01-27T..."
    }
  ]
}
```

#### 4. **Get Messages (Paginated)**
```http
GET /api/chat/conversations/:conversationId/messages?userId=user123&limit=50&offset=0

Response:
{
  "messages": [...],
  "totalCount": 120,
  "hasMore": true
}
```

#### 5. **Send Message (via API)**
```http
POST /api/chat/messages
Content-Type: application/json

{
  "conversationId": "abc123...",
  "senderId": "user123",
  "senderRole": "user",
  "message": "Hello, is my print job ready?"
}

Response:
{
  "message": {
    "id": "msg789...",
    "conversationId": "abc123...",
    "senderId": "user123",
    "senderRole": "user",
    "message": "Hello, is my print job ready?",
    "createdAt": "2024-01-27T...",
    "readStatus": 0
  }
}
```

#### 6. **Mark Messages as Read**
```http
PATCH /api/chat/messages/read
Content-Type: application/json

{
  "conversationId": "abc123...",
  "userId": "user123"
}

Response:
{
  "success": true
}
```

#### 7. **Get Unread Count**
```http
GET /api/chat/messages/unread?userId=user123

Response:
{
  "unreadCount": 5
}
```

---

## WebSocket Events (Socket.IO)

### Client → Server Events

#### 1. **join**
```javascript
socket.emit('join', {
  userId: 'user123',
  printerShopId: null,  // or printer ID if printer
  role: 'user'  // or 'printer'
});
```

#### 2. **join_conversation**
```javascript
socket.emit('join_conversation', {
  conversationId: 'abc123...'
});
```

#### 3. **send_message**
```javascript
socket.emit('send_message', {
  conversationId: 'abc123...',
  senderId: 'user123',
  senderRole: 'user',
  message: 'Hello!'
});
```

#### 4. **typing**
```javascript
socket.emit('typing', {
  conversationId: 'abc123...',
  userId: 'user123',
  printerShopId: null,
  isTyping: true
});
```

#### 5. **mark_read**
```javascript
socket.emit('mark_read', {
  conversationId: 'abc123...',
  userId: 'user123',
  printerShopId: null
});
```

### Server → Client Events

#### 1. **new_message**
```javascript
socket.on('new_message', (message) => {
  // message: { id, conversationId, senderId, senderRole, message, createdAt, readStatus }
});
```

#### 2. **new_message_notification**
```javascript
socket.on('new_message_notification', ({ conversationId, message }) => {
  // Notification for users not in active conversation
});
```

#### 3. **user_typing**
```javascript
socket.on('user_typing', ({ conversationId, isTyping }) => {
  // Show/hide typing indicator
});
```

#### 4. **messages_read**
```javascript
socket.on('messages_read', ({ conversationId }) => {
  // Update UI to show messages as read
});
```

#### 5. **user_online / user_offline**
```javascript
socket.on('user_online', ({ identity, role }) => {
  // Update online status
});

socket.on('user_offline', ({ identity, role }) => {
  // Update offline status
});
```

#### 6. **error**
```javascript
socket.on('error', ({ message }) => {
  // Handle error
});
```

---

## Security & Access Control

### Validation Rules

#### 1. **Conversation Access**
- Users can only access conversations where `userId` matches their ID
- Printer shops can only access conversations where `printerShopId` matches their ID
- Backend validates on every request

```javascript
function validateUserAccess(conversationId, userId, db) {
  const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversationId);
  if (!conversation) return { valid: false, error: 'Conversation not found' };
  if (conversation.userId !== userId) {
    return { valid: false, error: 'Unauthorized access' };
  }
  return { valid: true, conversation };
}
```

#### 2. **Message Sending**
- Sender must be a participant in the conversation
- `senderRole` must match actual user role
- Token validation for authenticated users

#### 3. **Read Receipts**
- Users can only mark messages from printers as read
- Printers can only mark messages from users as read

---

## Frontend Architecture

### Context Provider: ChatContext

Located: `src/context/ChatContext.js`

**Responsibilities:**
- Manages Socket.IO connection
- Maintains conversation and message state
- Provides chat operations (send, load, mark read)
- Handles online status and typing indicators

**Key Functions:**
```javascript
- loadConversations()              // Fetch user's conversations
- getOrCreateConversation(printerId) // Start new chat
- loadMessages(conversationId)     // Load message history
- sendMessage(conversationId, msg) // Send message via socket
- joinConversation(conversationId) // Join socket room
- markMessagesAsRead(conversationId) // Mark as read
- sendTyping(conversationId, isTyping) // Typing indicator
```

### Components

#### 1. **ChatFloatingWidget**
Location: `src/components/ChatFloatingWidget.js`

- Floating button in bottom-right corner
- Shows unread count badge
- Opens chat list or active conversation
- Positioned above content

#### 2. **ChatWindow**
Location: `src/components/Chat.js`

- Full conversation view
- Message list with auto-scroll
- Input area with send button
- Typing indicators
- Online/offline status

#### 3. **ChatList**
Location: `src/components/Chat.js`

- List of all conversations
- Shows unread badges
- Recent conversations first
- Search functionality

#### 4. **ChatPage**
Location: `src/pages/Chat.js`

- Full-page chat interface
- Split view: conversations | messages
- Printer selector for new chats
- Responsive (mobile switches between views)

---

## Message Lifecycle

### 1. **User Sends Message**
```
User types → Send button → 
socket.emit('send_message') → 
Server validates → 
Save to DB → 
io.to(conversationId).emit('new_message') → 
All clients in room receive
```

### 2. **Message Persistence**
- Messages saved to database **before** emitting
- Guarantees no message loss even if socket disconnects
- On reconnect, messages sync from database

### 3. **Read Receipts**
```
User opens conversation → 
socket.emit('mark_read') → 
Server updates DB → 
socket.to(room).emit('messages_read') → 
Sender sees read status
```

---

## Performance Optimizations

### 1. **Pagination**
- Load 50 messages at a time
- Infinite scroll for older messages
- Reduces initial load time

### 2. **Lazy Loading**
- Conversations loaded on demand
- Messages fetched only when conversation opened
- Reduces memory footprint

### 3. **Efficient State Management**
- Messages stored by conversationId in map
- Avoids re-renders of unrelated conversations
- Uses React Context for global state

### 4. **Database Indexes**
- Indexed on conversationId, userId, createdAt
- Fast lookups for user's conversations
- Efficient unread count queries

---

## Integration Steps

### Backend

1. **Install dependencies:**
```bash
cd server
npm install socket.io
```

2. **Files created/modified:**
- `server/src/storage/db.js` - Database schema
- `server/src/web/chat.routes.js` - REST API
- `server/src/server.js` - Socket.IO integration
- `server/package.json` - Dependencies

### Frontend

1. **Install dependencies:**
```bash
npm install socket.io-client
```

2. **Files created/modified:**
- `src/context/ChatContext.js` - Chat state management
- `src/components/Chat.js` - Chat UI components
- `src/components/ChatFloatingWidget.js` - Floating button
- `src/pages/Chat.js` - Full chat page
- `src/components/Layout.js` - Add floating widget
- `src/components/Sidebar.js` - Add Messages link
- `src/App.js` - Add ChatProvider and route
- `package.json` - Dependencies

---

## Testing Checklist

### Functional Tests
- [ ] User can start conversation with printer shop
- [ ] Messages send and receive in real-time
- [ ] Conversations persist across sessions
- [ ] No duplicate conversations created
- [ ] Unread badges update correctly
- [ ] Typing indicators work
- [ ] Online/offline status displays
- [ ] Messages marked as read
- [ ] Pagination loads older messages

### Security Tests
- [ ] Users cannot access other users' chats
- [ ] Printer shops cannot access wrong conversations
- [ ] Token validation works
- [ ] SQL injection prevented
- [ ] XSS attacks prevented

### Performance Tests
- [ ] Page loads quickly with many conversations
- [ ] Messages render smoothly
- [ ] No memory leaks on long sessions
- [ ] Socket reconnection works

---

## Environment Variables

Add to `.env`:
```
CLIENT_URL=http://localhost:3000
PUBLIC_BASE_URL=http://localhost:4000
```

For frontend (`.env` in root):
```
REACT_APP_SOCKET_URL=http://localhost:4000
```

---

## Deployment Notes

### Production Considerations

1. **WebSocket Configuration**
   - Configure CORS for production domain
   - Use SSL/TLS for secure connections (wss://)
   - Set up load balancer sticky sessions

2. **Database**
   - Ensure indexes are created
   - Monitor query performance
   - Consider archiving old messages

3. **Scaling**
   - Use Redis adapter for Socket.IO clustering
   - Horizontal scaling requires shared session store
   - Consider message queue for high traffic

---

## Future Enhancements

### Optional Features (Not Implemented)

1. **File Sharing** - Share images/PDFs in chat
2. **Message Reactions** - Like/emoji reactions
3. **Message Editing** - Edit sent messages
4. **Message Deletion** - Delete messages
5. **Group Chats** - Multi-user conversations
6. **Push Notifications** - Browser notifications
7. **Message Search** - Full-text search
8. **Voice Messages** - Audio recording
9. **Video Calls** - WebRTC integration

---

## Troubleshooting

### Common Issues

#### 1. Socket Connection Fails
- Check CORS settings in server
- Verify CLIENT_URL environment variable
- Check firewall/network settings

#### 2. Messages Not Persisting
- Check database file permissions
- Verify foreign key constraints
- Check server logs for errors

#### 3. Unread Count Wrong
- Verify readStatus updates in DB
- Check mark_read event handler
- Ensure proper user role validation

#### 4. Typing Indicator Stuck
- Timeout mechanism should auto-clear after 3s
- Check socket connection status
- Verify event emission

---

## Conclusion

This chat implementation provides:
✅ Persistent 1-to-1 conversations  
✅ Real-time message delivery  
✅ Secure access control  
✅ WhatsApp-style interface  
✅ Offline message persistence  
✅ Scalable architecture  
✅ Production-ready code  

The system is lightweight, secure, and follows best practices for real-time communication.
