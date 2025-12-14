import express from 'express';
import { supabaseDb } from '../database/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all teachers
router.get('/', authenticate, async (req, res) => {
  try {
    const teachers = await supabaseDb.getTeachers();
    res.json(teachers);
  } catch (error: any) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get teacher by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const teacher = await supabaseDb.getTeacherById(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Get teacher's subjects and classes
    const subjects = await supabaseDb.getSubjects();
    const teacherSubjects = subjects.filter(s => teacher.subjectIds.includes(s.id));
    
    const classIds = new Set<string>();
    teacherSubjects.forEach(s => {
      s.classIds.forEach(cid => classIds.add(cid));
    });
    
    const classes = await supabaseDb.getClasses();
    const teacherClasses = classes.filter(c => classIds.has(c.id));

    res.json({
      ...teacher,
      subjects: teacherSubjects,
      classes: teacherClasses,
    });
  } catch (error: any) {
    console.error('Get teacher error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

export default router;
