import express from 'express';
import { getDatabase, saveDatabase } from '../database/index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all classes
router.get('/', authenticate, (req, res) => {
  const db = getDatabase();
  res.json(db.classes);
});

// Get class by ID
router.get('/:id', authenticate, (req, res) => {
  const db = getDatabase();
  const classItem = db.classes.find(c => c.id === req.params.id);
  
  if (!classItem) {
    return res.status(404).json({ error: 'Class not found' });
  }

  res.json(classItem);
});

// Create class (Admin only)
router.post('/', authenticate, authorize('admin'), (req, res) => {
  const db = getDatabase();
  const { name, level, teacherIds, studentIds } = req.body;

  const newClass = {
    id: `class-${Date.now()}`,
    name,
    level,
    teacherIds: teacherIds || [],
    studentIds: studentIds || [],
  };

  db.classes.push(newClass);
  saveDatabase();
  res.status(201).json(newClass);
});

// Update class (Admin only)
router.put('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDatabase();
  const classIndex = db.classes.findIndex(c => c.id === req.params.id);
  
  if (classIndex === -1) {
    return res.status(404).json({ error: 'Class not found' });
  }

  const { name, level, teacherIds, studentIds } = req.body;
  if (name) db.classes[classIndex].name = name;
  if (level) db.classes[classIndex].level = level;
  if (teacherIds) db.classes[classIndex].teacherIds = teacherIds;
  if (studentIds) db.classes[classIndex].studentIds = studentIds;

  saveDatabase();
  res.json(db.classes[classIndex]);
});

// Delete class (Admin only)
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDatabase();
  const classIndex = db.classes.findIndex(c => c.id === req.params.id);
  
  if (classIndex === -1) {
    return res.status(404).json({ error: 'Class not found' });
  }

  const classId = req.params.id;
  
  // Remove class from subjects
  db.subjects.forEach(subject => {
    subject.classIds = subject.classIds.filter(id => id !== classId);
  });
  
  // Remove timetable entries
  db.timetable = db.timetable.filter(t => t.classId !== classId);
  
  // Remove announcements targeting this class
  db.announcements = db.announcements.filter(a => 
    !(a.targetGroup === 'class' && a.targetIds.includes(classId))
  );

  db.classes.splice(classIndex, 1);
  saveDatabase();
  res.json({ message: 'Class deleted successfully' });
});

export default router;

