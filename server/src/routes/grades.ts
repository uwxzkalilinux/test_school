import express from 'express';
import { getDatabase, saveDatabase } from '../database/index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get grades
router.get('/', authenticate, (req: AuthRequest, res) => {
  const db = getDatabase();
  let grades = db.grades;

  // Filter based on role
  if (req.user!.role === 'student') {
    const student = db.students.find(s => s.userId === req.user!.id);
    if (student) {
      grades = grades.filter(g => g.studentId === student.id);
    }
  } else if (req.user!.role === 'parent') {
    const user = db.users.find(u => u.id === req.user!.id);
    if (user?.parentOf) {
      const studentIds = db.students
        .filter(s => user.parentOf!.includes(s.id))
        .map(s => s.id);
      grades = grades.filter(g => studentIds.includes(g.studentId));
    }
  } else if (req.user!.role === 'teacher') {
    const teacher = db.teachers.find(t => t.userId === req.user!.id);
    if (teacher) {
      const subjectIds = teacher.subjectIds;
      grades = grades.filter(g => subjectIds.includes(g.subjectId));
    }
  }

  res.json(grades);
});

// Get grades by student ID
router.get('/student/:studentId', authenticate, (req, res) => {
  const db = getDatabase();
  const grades = db.grades.filter(g => g.studentId === req.params.studentId);
  res.json(grades);
});

// Add grade (Teacher only)
router.post('/', authenticate, authorize('teacher'), (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const { studentId, subjectId, examType, score, maxScore, comments } = req.body;

    if (!studentId || !subjectId || !examType || score === undefined) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    const teacher = db.teachers.find(t => t.userId === req.user!.id);
    if (!teacher) {
      return res.status(404).json({ error: 'المعلم غير موجود' });
    }

    // Validate that teacher teaches this subject
    if (!teacher.subjectIds?.includes(subjectId)) {
      return res.status(400).json({ error: 'المعلم لا يدرس هذه المادة' });
    }

    // Validate student exists
    const student = db.students.find(s => s.id === studentId);
    if (!student) {
      return res.status(404).json({ error: 'الطالب غير موجود' });
    }

    const newGrade = {
      id: `grade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      subjectId,
      examType,
      score: parseFloat(score),
      maxScore: maxScore ? parseFloat(maxScore) : 100,
      date: new Date().toISOString(),
      teacherId: teacher.id,
      comments: comments || '',
    };

    db.grades.push(newGrade);
    saveDatabase();
    res.status(201).json(newGrade);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'خطأ في الخادم' });
  }
});

// Update grade (Teacher only)
router.put('/:id', authenticate, authorize('teacher'), (req, res) => {
  const db = getDatabase();
  const gradeIndex = db.grades.findIndex(g => g.id === req.params.id);
  
  if (gradeIndex === -1) {
    return res.status(404).json({ error: 'Grade not found' });
  }

  const { score, maxScore, comments } = req.body;
  if (score !== undefined) db.grades[gradeIndex].score = score;
  if (maxScore !== undefined) db.grades[gradeIndex].maxScore = maxScore;
  if (comments !== undefined) db.grades[gradeIndex].comments = comments;

  saveDatabase();
  res.json(db.grades[gradeIndex]);
});

// Delete grade (Teacher only)
router.delete('/:id', authenticate, authorize('teacher'), (req, res) => {
  const db = getDatabase();
  const gradeIndex = db.grades.findIndex(g => g.id === req.params.id);
  
  if (gradeIndex === -1) {
    return res.status(404).json({ error: 'الدرجة غير موجودة' });
  }

  db.grades.splice(gradeIndex, 1);
  saveDatabase();
  res.json({ message: 'تم حذف الدرجة بنجاح' });
});

export default router;

