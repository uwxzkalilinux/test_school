import express from 'express';
import { supabaseDb } from '../database/index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get grades
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    let grades = await supabaseDb.getGrades();

    // Filter based on role
    if (req.user!.role === 'student') {
      const student = await supabaseDb.getStudentByUserId(req.user!.id);
      if (student) {
        grades = grades.filter(g => g.studentId === student.id);
      }
    } else if (req.user!.role === 'parent') {
      const user = await supabaseDb.getUserById(req.user!.id);
      if (user?.parentOf) {
        const studentIds = user.parentOf;
        grades = grades.filter(g => studentIds.includes(g.studentId));
      }
    } else if (req.user!.role === 'teacher') {
      const teacher = await supabaseDb.getTeacherByUserId(req.user!.id);
      if (teacher) {
        const subjectIds = teacher.subjectIds;
        grades = grades.filter(g => subjectIds.includes(g.subjectId));
      }
    }

    res.json(grades);
  } catch (error: any) {
    console.error('Get grades error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get grades by student ID
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const grades = await supabaseDb.getGradesByStudent(req.params.studentId);
    res.json(grades);
  } catch (error: any) {
    console.error('Get grades by student error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Add grade (Teacher only)
router.post('/', authenticate, authorize('teacher'), async (req: AuthRequest, res) => {
  try {
    const { studentId, subjectId, examType, score, maxScore, comments } = req.body;

    if (!studentId || !subjectId || !examType || score === undefined) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    const teacher = await supabaseDb.getTeacherByUserId(req.user!.id);
    if (!teacher) {
      return res.status(404).json({ error: 'المعلم غير موجود' });
    }

    // Validate that teacher teaches this subject
    if (!teacher.subjectIds?.includes(subjectId)) {
      return res.status(400).json({ error: 'المعلم لا يدرس هذه المادة' });
    }

    // Validate student exists
    const student = await supabaseDb.getStudentById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'الطالب غير موجود' });
    }

    const newGrade = await supabaseDb.createGrade({
      studentId,
      subjectId,
      examType,
      score: parseFloat(score),
      maxScore: maxScore ? parseFloat(maxScore) : 100,
      date: new Date().toISOString().split('T')[0],
      teacherId: teacher.id,
      comments: comments || '',
    });

    res.status(201).json(newGrade);
  } catch (error: any) {
    console.error('Add grade error:', error);
    res.status(500).json({ error: error.message || 'خطأ في الخادم' });
  }
});

// Update grade (Teacher only)
router.put('/:id', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const { score, maxScore, comments } = req.body;
    const updates: any = {};
    
    if (score !== undefined) updates.score = score;
    if (maxScore !== undefined) updates.maxScore = maxScore;
    if (comments !== undefined) updates.comments = comments;

    const updatedGrade = await supabaseDb.updateGrade(req.params.id, updates);
    res.json(updatedGrade);
  } catch (error: any) {
    console.error('Update grade error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete grade (Teacher only)
router.delete('/:id', authenticate, authorize('teacher'), async (req, res) => {
  try {
    await supabaseDb.deleteGrade(req.params.id);
    res.json({ message: 'تم حذف الدرجة بنجاح' });
  } catch (error: any) {
    console.error('Delete grade error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

export default router;
