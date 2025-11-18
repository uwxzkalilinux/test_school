import express from 'express';
import { getDatabase, saveDatabase } from '../database/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get messages
router.get('/', authenticate, (req: AuthRequest, res) => {
  const db = getDatabase();
  const messages = db.messages.filter(
    m => m.fromUser === req.user!.id || m.toUser === req.user!.id || 
    (m.groupId && db.classes.find(c => c.id === m.groupId && (c.studentIds.includes(req.user!.id) || c.teacherIds.includes(req.user!.id))))
  );
  
  res.json(messages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
});

// Get conversation with a user
router.get('/conversation/:userId', authenticate, (req: AuthRequest, res) => {
  const db = getDatabase();
  const messages = db.messages.filter(
    m => (m.fromUser === req.user!.id && m.toUser === req.params.userId) ||
         (m.fromUser === req.params.userId && m.toUser === req.user!.id)
  );
  
  res.json(messages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
});

// Get group messages
router.get('/group/:groupId', authenticate, (req, res) => {
  const db = getDatabase();
  const messages = db.messages.filter(m => m.groupId === req.params.groupId);
  
  res.json(messages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
});

// Send message
router.post('/', authenticate, (req: AuthRequest, res) => {
  const db = getDatabase();
  const { toUser, groupId, groupType, body } = req.body;

  if (!toUser && !groupId) {
    return res.status(400).json({ error: 'Either toUser or groupId is required' });
  }

  const newMessage = {
    id: `message-${Date.now()}`,
    fromUser: req.user!.id,
    toUser: toUser || undefined,
    groupId: groupId || undefined,
    groupType: groupType || undefined,
    body,
    date: new Date().toISOString(),
    read: false,
    attachments: [],
  };

  db.messages.push(newMessage);
  saveDatabase();
  res.status(201).json(newMessage);
});

// Mark message as read
router.put('/:id/read', authenticate, (req: AuthRequest, res) => {
  const db = getDatabase();
  const messageIndex = db.messages.findIndex(m => m.id === req.params.id);
  
  if (messageIndex === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }

  const message = db.messages[messageIndex];
  if (message.toUser !== req.user!.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.messages[messageIndex].read = true;
  saveDatabase();
  res.json(db.messages[messageIndex]);
});

export default router;

