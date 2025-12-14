import express from 'express';
import { supabaseDb } from '../database/index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get attendance records
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    let attendance = await supabaseDb.getAttendance();

    // Filter based on role
    if (req.user!.role === 'student') {
      const student = await supabaseDb.getStudentByUserId(req.user!.id);
      if (student) {
        attendance = attendance.filter(a => a.studentId === student.id);
      }
    } else if (req.user!.role === 'parent') {
      const user = await supabaseDb.getUserById(req.user!.id);
      if (user?.parentOf) {
        const studentIds = user.parentOf;
        attendance = attendance.filter(a => studentIds.includes(a.studentId));
      }
    } else if (req.user!.role === 'teacher') {
      const teacher = await supabaseDb.getTeacherByUserId(req.user!.id);
      if (teacher) {
        const subjectIds = teacher.subjectIds;
        attendance = attendance.filter(a => subjectIds.includes(a.subjectId));
      }
    }

    res.json(attendance);
  } catch (error: any) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get attendance by student ID
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const attendance = await supabaseDb.getAttendanceByStudent(req.params.studentId);
    res.json(attendance);
  } catch (error: any) {
    console.error('Get attendance by student error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Mark attendance (Teacher only)
router.post('/', authenticate, authorize('teacher'), async (req: AuthRequest, res) => {
  try {
    const { studentId, subjectId, classId, date, status } = req.body;

    if (!studentId || !subjectId || !classId || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const teacher = await supabaseDb.getTeacherByUserId(req.user!.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Check if attendance already exists and update, otherwise create
    const existingAttendance = await supabaseDb.getAttendance();
    const existing = existingAttendance.find(
      a => a.studentId === studentId && a.subjectId === subjectId && a.date === date
    );

    if (existing) {
      const updated = await supabaseDb.updateAttendance(existing.id, {
        status: status || 'present',
      });
      return res.json(updated);
    }

    const attendanceRecord = await supabaseDb.createAttendance({
      studentId,
      subjectId,
      classId,
      date,
      status: status || 'present',
      markedBy: teacher.id,
    });

    res.status(201).json(attendanceRecord);
  } catch (error: any) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Bulk mark attendance (Teacher only)
router.post('/bulk', authenticate, authorize('teacher'), async (req: AuthRequest, res) => {
  try {
    const { records, subjectId, classId, date } = req.body;

    if (!records || !Array.isArray(records) || !subjectId || !classId || !date) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const teacher = await supabaseDb.getTeacherByUserId(req.user!.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const createdRecords = [];

    for (const record of records) {
      // Check if exists
      const existingAttendance = await supabaseDb.getAttendance();
      const existing = existingAttendance.find(
        a => a.studentId === record.studentId && a.subjectId === subjectId && a.date === date
      );

      if (existing) {
        const updated = await supabaseDb.updateAttendance(existing.id, {
          status: record.status || 'present',
        });
        createdRecords.push(updated);
      } else {
        const attendanceRecord = await supabaseDb.createAttendance({
          studentId: record.studentId,
          subjectId,
          classId,
          date,
          status: record.status || 'present',
          markedBy: teacher.id,
        });
        createdRecords.push(attendanceRecord);
      }
    }

    res.status(201).json(createdRecords);
  } catch (error: any) {
    console.error('Bulk mark attendance error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

export default router;
