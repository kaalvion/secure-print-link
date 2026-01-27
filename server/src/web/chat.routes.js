import { Router } from 'express';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

const router = Router();

// Generate deterministic conversation ID from userId and printerShopId
function generateConversationId(userId, printerShopId) {
  // Sort to ensure consistent ID regardless of order
  const sortedIds = [userId, printerShopId].sort();
  return crypto
    .createHash('sha256')
    .update(sortedIds.join(':'))
    .digest('hex')
    .substring(0, 32);
}

// Validate access: user can only access their own conversations
function validateUserAccess(conversationId, userId, db) {
  const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversationId);
  if (!conversation) return { valid: false, error: 'Conversation not found' };
  if (conversation.userId !== userId) {
    return { valid: false, error: 'Unauthorized access' };
  }
  return { valid: true, conversation };
}

// Validate access: printer shop can only access their conversations
function validatePrinterAccess(conversationId, printerShopId, db) {
  const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversationId);
  if (!conversation) return { valid: false, error: 'Conversation not found' };
  if (conversation.printerShopId !== printerShopId) {
    return { valid: false, error: 'Unauthorized access' };
  }
  return { valid: true, conversation };
}

// Get or create conversation between user and printer shop
router.post('/conversations', (req, res) => {
  const db = req.db;
  const { userId, printerShopId } = req.body;

  if (!userId || !printerShopId) {
    return res.status(400).json({ error: 'userId and printerShopId are required' });
  }

  // Verify user exists
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Verify printer shop exists
  const printer = db.prepare('SELECT * FROM printers WHERE id = ?').get(printerShopId);
  if (!printer) {
    return res.status(404).json({ error: 'Printer shop not found' });
  }

  // Generate deterministic conversation ID
  const conversationId = generateConversationId(userId, printerShopId);

  // Check if conversation already exists
  let conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversationId);

  if (!conversation) {
    // Create new conversation
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO conversations (id, userId, printerShopId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(conversationId, userId, printerShopId, now, now);

    conversation = { id: conversationId, userId, printerShopId, createdAt: now, updatedAt: now, lastMessageAt: null };
  }

  res.json({ conversation });
});

// Get all conversations for a user
router.get('/conversations/user/:userId', (req, res) => {
  const db = req.db;
  const { userId } = req.params;

  const conversations = db.prepare(`
    SELECT 
      c.*,
      p.name as printerShopName,
      p.location as printerShopLocation,
      (SELECT COUNT(*) FROM messages WHERE conversationId = c.id AND readStatus = 0 AND senderId != ?) as unreadCount
    FROM conversations c
    JOIN printers p ON c.printerShopId = p.id
    WHERE c.userId = ?
    ORDER BY c.lastMessageAt DESC NULLS LAST, c.createdAt DESC
  `).all(userId, userId);

  res.json({ conversations });
});

// Get all conversations for a printer shop
router.get('/conversations/printer/:printerShopId', (req, res) => {
  const db = req.db;
  const { printerShopId } = req.params;

  const conversations = db.prepare(`
    SELECT 
      c.*,
      u.name as userName,
      u.email as userEmail,
      (SELECT COUNT(*) FROM messages WHERE conversationId = c.id AND readStatus = 0 AND senderId != ?) as unreadCount
    FROM conversations c
    JOIN users u ON c.userId = u.id
    WHERE c.printerShopId = ?
    ORDER BY c.lastMessageAt DESC NULLS LAST, c.createdAt DESC
  `).all(printerShopId, printerShopId);

  res.json({ conversations });
});

// Get messages for a conversation (with pagination)
router.get('/conversations/:conversationId/messages', (req, res) => {
  const db = req.db;
  const { conversationId } = req.params;
  const { userId, printerShopId, limit = 50, offset = 0 } = req.query;

  // Validate access
  if (userId) {
    const validation = validateUserAccess(conversationId, userId, db);
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }
  } else if (printerShopId) {
    const validation = validatePrinterAccess(conversationId, printerShopId, db);
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }
  } else {
    return res.status(400).json({ error: 'userId or printerShopId is required' });
  }

  // Get messages with pagination (most recent first)
  const messages = db.prepare(`
    SELECT * FROM messages 
    WHERE conversationId = ? 
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?
  `).all(conversationId, parseInt(limit), parseInt(offset));

  // Reverse to show oldest first
  messages.reverse();

  // Get total count
  const totalCount = db.prepare('SELECT COUNT(*) as count FROM messages WHERE conversationId = ?').get(conversationId).count;

  res.json({ messages, totalCount, hasMore: (parseInt(offset) + messages.length) < totalCount });
});

// Send a message
router.post('/messages', (req, res) => {
  const db = req.db;
  const { conversationId, senderId, senderRole, message } = req.body;

  if (!conversationId || !senderId || !senderRole || !message) {
    return res.status(400).json({ error: 'conversationId, senderId, senderRole, and message are required' });
  }

  // Validate senderRole
  if (!['user', 'printer'].includes(senderRole)) {
    return res.status(400).json({ error: 'senderRole must be "user" or "printer"' });
  }

  // Validate access
  if (senderRole === 'user') {
    const validation = validateUserAccess(conversationId, senderId, db);
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }
  } else {
    const validation = validatePrinterAccess(conversationId, senderId, db);
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }
  }

  // Create message
  const messageId = nanoid();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO messages (id, conversationId, senderId, senderRole, message, createdAt, readStatus)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `).run(messageId, conversationId, senderId, senderRole, message, now);

  // Update conversation's lastMessageAt
  db.prepare('UPDATE conversations SET lastMessageAt = ?, updatedAt = ? WHERE id = ?')
    .run(now, now, conversationId);

  const newMessage = {
    id: messageId,
    conversationId,
    senderId,
    senderRole,
    message,
    createdAt: now,
    readStatus: 0
  };

  res.json({ message: newMessage });
});

// Mark messages as read
router.patch('/messages/read', (req, res) => {
  const db = req.db;
  const { conversationId, userId, printerShopId } = req.body;

  if (!conversationId || (!userId && !printerShopId)) {
    return res.status(400).json({ error: 'conversationId and (userId or printerShopId) are required' });
  }

  // Validate access
  if (userId) {
    const validation = validateUserAccess(conversationId, userId, db);
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }
    // Mark messages from printer as read
    db.prepare(`
      UPDATE messages 
      SET readStatus = 1 
      WHERE conversationId = ? AND senderRole = 'printer' AND readStatus = 0
    `).run(conversationId);
  } else {
    const validation = validatePrinterAccess(conversationId, printerShopId, db);
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }
    // Mark messages from user as read
    db.prepare(`
      UPDATE messages 
      SET readStatus = 1 
      WHERE conversationId = ? AND senderRole = 'user' AND readStatus = 0
    `).run(conversationId);
  }

  res.json({ success: true });
});

// Get unread message count
router.get('/messages/unread', (req, res) => {
  const db = req.db;
  const { userId, printerShopId } = req.query;

  if (!userId && !printerShopId) {
    return res.status(400).json({ error: 'userId or printerShopId is required' });
  }

  let unreadCount = 0;

  if (userId) {
    // Count unread messages for user (messages from printers)
    unreadCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM messages m
      JOIN conversations c ON m.conversationId = c.id
      WHERE c.userId = ? AND m.senderRole = 'printer' AND m.readStatus = 0
    `).get(userId).count;
  } else {
    // Count unread messages for printer shop (messages from users)
    unreadCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM messages m
      JOIN conversations c ON m.conversationId = c.id
      WHERE c.printerShopId = ? AND m.senderRole = 'user' AND m.readStatus = 0
    `).get(printerShopId).count;
  }

  res.json({ unreadCount });
});

export default router;
