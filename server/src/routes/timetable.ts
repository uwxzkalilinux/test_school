import express from 'express';
import { supabaseDb } from '../database/index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get timetable
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    let timetable = await supabaseDb.getTimetable();

    // Filter based on role
    if (req.user!.role === 'student') {
      const student = await supabaseDb.getStudentByUserId(req.user!.id);
      if (student) {
        timetable = timetable.filter(t => t.classId === student.classId);
      }
    } else if (req.user!.role === 'teacher') {
      const teacher = await supabaseDb.getTeacherByUserId(req.user!.id);
      if (teacher) {
        timetable = timetable.filter(t => t.teacherId === teacher.id);
      }
    }

    res.json(timetable);
  } catch (error: any) {
    console.error('Get timetable error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get timetable by class ID
router.get('/class/:classId', authenticate, async (req, res) => {
  try {
    const timetable = await supabaseDb.getTimetableByClass(req.params.classId);
    res.json(timetable);
  } catch (error: any) {
    console.error('Get timetable by class error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Create timetable entry (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { classId, subjectId, teacherId, day, startTime, endTime, room } = req.body;

    if (!classId || !subjectId || !teacherId || !day || !startTime || !endTime) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    // Validate that subject belongs to class
    const subject = await supabaseDb.getSubjectById(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'المادة غير موجودة' });
    }
    if (!subject.classIds?.includes(classId)) {
      return res.status(400).json({ error: 'المادة غير مرتبطة بهذا الصف' });
    }

    // Validate that teacher teaches this subject
    const teacher = await supabaseDb.getTeacherById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'المعلم غير موجود' });
    }
    if (!teacher.subjectIds?.includes(subjectId)) {
      return res.status(400).json({ error: 'المعلم لا يدرس هذه المادة' });
    }

    const newTimetable = await supabaseDb.createTimetable({
      classId,
      subjectId,
      teacherId,
      day,
      startTime,
      endTime,
      room: room || '',
    });

    res.status(201).json(newTimetable);
  } catch (error: any) {
    console.error('Create timetable error:', error);
    res.status(500).json({ error: error.message || 'خطأ في الخادم' });
  }
});

// Update timetable entry (Admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { classId, subjectId, teacherId, day, startTime, endTime, room } = req.body;
    const updates: any = {};
    
    if (classId) updates.classId = classId;
    if (subjectId) updates.subjectId = subjectId;
    if (teacherId) updates.teacherId = teacherId;
    if (day) updates.day = day;
    if (startTime) updates.startTime = startTime;
    if (endTime) updates.endTime = endTime;
    if (room !== undefined) updates.room = room;

    const updatedTimetable = await supabaseDb.updateTimetable(req.params.id, updates);
    res.json(updatedTimetable);
  } catch (error: any) {
    console.error('Update timetable error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete timetable entry (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await supabaseDb.deleteTimetable(req.params.id);
    res.json({ message: 'تم حذف الحصة بنجاح' });
  } catch (error: any) {
    console.error('Delete timetable error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

export default router;
