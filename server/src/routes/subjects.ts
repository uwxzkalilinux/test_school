import express from 'express';
import { supabaseDb } from '../database/index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all subjects
router.get('/', authenticate, async (req, res) => {
  try {
    const subjects = await supabaseDb.getSubjects();
    res.json(subjects);
  } catch (error: any) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get subject by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const subject = await supabaseDb.getSubjectById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject);
  } catch (error: any) {
    console.error('Get subject error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Create subject (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, teacherId, classIds, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    const newSubject = await supabaseDb.createSubject({
      name,
      code,
      teacherId: teacherId || '',
      classIds: classIds || [],
    });

    res.status(201).json(newSubject);
  } catch (error: any) {
    console.error('Create subject error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update subject (Admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, teacherId, classIds, code } = req.body;
    const updates: any = {};
    
    if (name) updates.name = name;
    if (code) updates.code = code;
    if (teacherId !== undefined) updates.teacherId = teacherId;
    if (classIds !== undefined) updates.classIds = classIds;

    const updatedSubject = await supabaseDb.updateSubject(req.params.id, updates);
    res.json(updatedSubject);
  } catch (error: any) {
    console.error('Update subject error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete subject (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await supabaseDb.deleteSubject(req.params.id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error: any) {
    console.error('Delete subject error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

export default router;
