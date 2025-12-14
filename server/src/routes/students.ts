import express from 'express';
import { supabaseDb } from '../database/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all students
router.get('/', authenticate, async (req, res) => {
  try {
    const students = await supabaseDb.getStudents();
    const studentsWithDetails = await Promise.all(students.map(async (student) => {
      const classItem = await supabaseDb.getClassById(student.classId);
      const user = await supabaseDb.getUserById(student.userId);
      return {
        ...student,
        class: classItem,
        user: user ? { id: user.id, name: user.name, email: user.email } : null,
      };
    }));
    res.json(studentsWithDetails);
  } catch (error: any) {
    console.error('Get students error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get student by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const student = await supabaseDb.getStudentById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const classItem = await supabaseDb.getClassById(student.classId);
    const user = await supabaseDb.getUserById(student.userId);
    const subjects = await supabaseDb.getSubjects();
    const studentSubjects = subjects.filter(s => s.classIds.includes(student.classId));
    
    res.json({
      ...student,
      class: classItem,
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
      subjects: studentSubjects,
    });
  } catch (error: any) {
    console.error('Get student error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

export default router;
