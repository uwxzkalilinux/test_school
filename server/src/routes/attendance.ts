import express from 'express';
import { getDatabase, saveDatabase } from '../database/index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get attendance records
router.get('/', authenticate, (req: AuthRequest, res) => {
  const db = getDatabase();
  let attendance = db.attendance;

  // Filter based on role
  if (req.user!.role === 'student') {
    const student = db.students.find(s => s.userId === req.user!.id);
    if (student) {
      attendance = attendance.filter(a => a.studentId === student.id);
    }
  } else if (req.user!.role === 'parent') {
    const user = db.users.find(u => u.id === req.user!.id);
    if (user?.parentOf) {
      const studentIds = db.students
        .filter(s => user.parentOf!.includes(s.id))
        .map(s => s.id);
      attendance = attendance.filter(a => studentIds.includes(a.studentId));
    }
  } else if (req.user!.role === 'teacher') {
    const teacher = db.teachers.find(t => t.userId === req.user!.id);
    if (teacher) {
      const subjectIds = teacher.subjectIds;
      attendance = attendance.filter(a => subjectIds.includes(a.subjectId));
    }
  }

  res.json(attendance);
});

// Get attendance by student ID
router.get('/student/:studentId', authenticate, (req, res) => {
  const db = getDatabase();
  const attendance = db.attendance.filter(a => a.studentId === req.params.studentId);
  res.json(attendance);
});

// Mark attendance (Teacher only)
router.post('/', authenticate, authorize('teacher'), (req: AuthRequest, res) => {
  const db = getDatabase();
  const { studentId, subjectId, classId, date, status } = req.body;

  const teacher = db.teachers.find(t => t.userId === req.user!.id);
  if (!teacher) {
    return res.status(404).json({ error: 'Teacher not found' });
  }

  // Check if attendance already exists
  const existingIndex = db.attendance.findIndex(
    a => a.studentId === studentId && a.subjectId === subjectId && a.date === date
  );

  const attendanceRecord = {
    id: `attendance-${Date.now()}`,
    studentId,
    subjectId,
    classId,
    date,
    status: status || 'present',
    markedBy: teacher.id,
  };

  if (existingIndex !== -1) {
    db.attendance[existingIndex] = attendanceRecord;
  } else {
    db.attendance.push(attendanceRecord);
  }

  saveDatabase();
  res.status(201).json(attendanceRecord);
});

// Bulk mark attendance (Teacher only)
router.post('/bulk', authenticate, authorize('teacher'), (req: AuthRequest, res) => {
  const db = getDatabase();
  const { records } = req.body; // Array of {studentId, status}

  const teacher = db.teachers.find(t => t.userId === req.user!.id);
  if (!teacher) {
    return res.status(404).json({ error: 'Teacher not found' });
  }

  const { subjectId, classId, date } = req.body;
  const createdRecords = [];

  for (const record of records) {
    const existingIndex = db.attendance.findIndex(
      a => a.studentId === record.studentId && a.subjectId === subjectId && a.date === date
    );

    const attendanceRecord = {
      id: `attendance-${Date.now()}-${Math.random()}`,
      studentId: record.studentId,
      subjectId,
      classId,
      date,
      status: record.status || 'present',
      markedBy: teacher.id,
    };

    if (existingIndex !== -1) {
      db.attendance[existingIndex] = attendanceRecord;
    } else {
      db.attendance.push(attendanceRecord);
    }
    createdRecords.push(attendanceRecord);
  }

  saveDatabase();
  res.status(201).json(createdRecords);
});

export default router;

