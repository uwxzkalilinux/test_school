import express from 'express';
import { getDatabase } from '../database/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all teachers
router.get('/', authenticate, (req, res) => {
  const db = getDatabase();
  res.json(db.teachers);
});

// Get teacher by ID
router.get('/:id', authenticate, (req, res) => {
  const db = getDatabase();
  const teacher = db.teachers.find(t => t.id === req.params.id);
  
  if (!teacher) {
    return res.status(404).json({ error: 'Teacher not found' });
  }

  // Get teacher's subjects and classes
  const subjects = db.subjects.filter(s => s.teacherId === teacher.id);
  const classIds = new Set<string>();
  subjects.forEach(s => {
    s.classIds.forEach(cid => classIds.add(cid));
  });
  const classes = db.classes.filter(c => classIds.has(c.id));

  res.json({
    ...teacher,
    subjects,
    classes,
  });
});

export default router;

