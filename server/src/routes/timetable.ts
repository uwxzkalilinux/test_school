import express from 'express';
import { getDatabase, saveDatabase } from '../database/index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get timetable
router.get('/', authenticate, (req: AuthRequest, res) => {
  const db = getDatabase();
  let timetable = db.timetable;

  // Filter based on role
  if (req.user!.role === 'student') {
    const student = db.students.find(s => s.userId === req.user!.id);
    if (student) {
      timetable = timetable.filter(t => t.classId === student.classId);
    }
  } else if (req.user!.role === 'teacher') {
    const teacher = db.teachers.find(t => t.userId === req.user!.id);
    if (teacher) {
      timetable = timetable.filter(t => t.teacherId === teacher.id);
    }
  }

  res.json(timetable);
});

// Get timetable by class ID
router.get('/class/:classId', authenticate, (req, res) => {
  const db = getDatabase();
  const timetable = db.timetable.filter(t => t.classId === req.params.classId);
  res.json(timetable);
});

// Create timetable entry (Admin only)
router.post('/', authenticate, authorize('admin'), (req, res) => {
  try {
    const db = getDatabase();
    const { classId, subjectId, teacherId, day, startTime, endTime, room } = req.body;

    if (!classId || !subjectId || !teacherId || !day || !startTime || !endTime) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    // Validate that subject belongs to class
    const subject = db.subjects.find(s => s.id === subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'المادة غير موجودة' });
    }
    if (!subject.classIds?.includes(classId)) {
      return res.status(400).json({ error: 'المادة غير مرتبطة بهذا الصف' });
    }

    // Validate that teacher teaches this subject
    const teacher = db.teachers.find(t => t.id === teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'المعلم غير موجود' });
    }
    if (!teacher.subjectIds?.includes(subjectId)) {
      return res.status(400).json({ error: 'المعلم لا يدرس هذه المادة' });
    }

    const newTimetable = {
      id: `timetable-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      classId,
      subjectId,
      teacherId,
      day,
      startTime,
      endTime,
      room: room || '',
    };

    db.timetable.push(newTimetable);
    saveDatabase();
    res.status(201).json(newTimetable);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'خطأ في الخادم' });
  }
});

// Update timetable entry (Admin only)
router.put('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDatabase();
  const timetableIndex = db.timetable.findIndex(t => t.id === req.params.id);
  
  if (timetableIndex === -1) {
    return res.status(404).json({ error: 'Timetable entry not found' });
  }

  const { classId, subjectId, teacherId, day, startTime, endTime, room } = req.body;
  if (classId) db.timetable[timetableIndex].classId = classId;
  if (subjectId) db.timetable[timetableIndex].subjectId = subjectId;
  if (teacherId) db.timetable[timetableIndex].teacherId = teacherId;
  if (day) db.timetable[timetableIndex].day = day;
  if (startTime) db.timetable[timetableIndex].startTime = startTime;
  if (endTime) db.timetable[timetableIndex].endTime = endTime;
  if (room !== undefined) db.timetable[timetableIndex].room = room;

  saveDatabase();
  res.json(db.timetable[timetableIndex]);
});

// Delete timetable entry (Admin only)
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDatabase();
  const timetableIndex = db.timetable.findIndex(t => t.id === req.params.id);
  
  if (timetableIndex === -1) {
    return res.status(404).json({ error: 'الحصة غير موجودة' });
  }

  db.timetable.splice(timetableIndex, 1);
  saveDatabase();
  res.json({ message: 'تم حذف الحصة بنجاح' });
});

export default router;

