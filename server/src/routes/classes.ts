import express from 'express';
import { supabaseDb } from '../database/index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all classes
router.get('/', authenticate, async (req, res) => {
  try {
    const classes = await supabaseDb.getClasses();
    res.json(classes);
  } catch (error: any) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get class by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const classItem = await supabaseDb.getClassById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(classItem);
  } catch (error: any) {
    console.error('Get class error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Create class (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, level } = req.body;

    if (!name || !level) {
      return res.status(400).json({ error: 'Name and level are required' });
    }

    const newClass = await supabaseDb.createClass({
      name,
      level,
      teacherIds: [],
      studentIds: [],
    });

    res.status(201).json(newClass);
  } catch (error: any) {
    console.error('Create class error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update class (Admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, level } = req.body;
    const updates: any = {};
    
    if (name) updates.name = name;
    if (level) updates.level = level;

    const updatedClass = await supabaseDb.updateClass(req.params.id, updates);
    res.json(updatedClass);
  } catch (error: any) {
    console.error('Update class error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete class (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await supabaseDb.deleteClass(req.params.id);
    res.json({ message: 'Class deleted successfully' });
  } catch (error: any) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

export default router;
