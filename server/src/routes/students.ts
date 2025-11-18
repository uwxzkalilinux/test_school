import express from 'express';
import { getDatabase } from '../database/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all students
router.get('/', authenticate, (req, res) => {
  const db = getDatabase();
  const students = db.students.map(student => {
    const classItem = db.classes.find(c => c.id === student.classId);
    const user = db.users.find(u => u.id === student.userId);
    return {
      ...student,
      class: classItem,
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
    };
  });
  res.json(students);
});

// Get student by ID
router.get('/:id', authenticate, (req, res) => {
  const db = getDatabase();
  const student = db.students.find(s => s.id === req.params.id);
  
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const classItem = db.classes.find(c => c.id === student.classId);
  const user = db.users.find(u => u.id === student.userId);
  const subjects = db.subjects.filter(s => s.classIds.includes(student.classId));
  
  res.json({
    ...student,
    class: classItem,
    user: user ? { id: user.id, name: user.name, email: user.email } : null,
    subjects,
  });
});

export default router;

