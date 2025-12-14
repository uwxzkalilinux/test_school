import express from 'express';
import { supabaseDb } from '../database/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get messages
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const messages = await supabaseDb.getMessages();
    const filtered = messages.filter(m => 
      m.fromUser === req.user!.id || 
      m.toUser === req.user!.id ||
      (m.groupId && m.groupType === 'class')
    );
    
    res.json(filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get conversation with a user
router.get('/conversation/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    const messages = await supabaseDb.getMessages();
    const filtered = messages.filter(m =>
      (m.fromUser === req.user!.id && m.toUser === req.params.userId) ||
      (m.fromUser === req.params.userId && m.toUser === req.user!.id)
    );
    
    res.json(filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  } catch (error: any) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get group messages
router.get('/group/:groupId', authenticate, async (req, res) => {
  try {
    const messages = await supabaseDb.getMessages();
    const filtered = messages.filter(m => m.groupId === req.params.groupId);
    
    res.json(filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  } catch (error: any) {
    console.error('Get group messages error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Send message
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { toUser, groupId, groupType, body } = req.body;

    if (!toUser && !groupId) {
      return res.status(400).json({ error: 'Either toUser or groupId is required' });
    }

    const newMessage = await supabaseDb.createMessage({
      fromUser: req.user!.id,
      toUser: toUser || undefined,
      groupId: groupId || undefined,
      groupType: groupType || undefined,
      body,
      read: false,
      attachments: [],
    });

    res.status(201).json(newMessage);
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Mark message as read
router.put('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const message = await supabaseDb.getMessageById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.toUser !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedMessage = await supabaseDb.updateMessage(req.params.id, { read: true });
    res.json(updatedMessage);
  } catch (error: any) {
    console.error('Mark message read error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

export default router;
