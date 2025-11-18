import express from 'express';
import { getDatabase, saveDatabase } from '../database/index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticate, authorize('admin'), (req, res) => {
  const db = getDatabase();
  const users = db.users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  }));
  res.json(users);
});

// Get user by ID
router.get('/:id', authenticate, (req: AuthRequest, res) => {
  const db = getDatabase();
  const user = db.users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Users can only view their own profile unless admin
  if (req.user!.id !== user.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

// Update user
router.put('/:id', authenticate, (req: AuthRequest, res) => {
  const db = getDatabase();
  const userIndex = db.users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Users can only update their own profile unless admin
  if (req.user!.id !== req.params.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { name, email } = req.body;
  if (name) db.users[userIndex].name = name;
  if (email) db.users[userIndex].email = email;

  saveDatabase();
  res.json(db.users[userIndex]);
});

// Create user (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role, classId, parentId, studentId } = req.body;
    const db = getDatabase();

    // Check if user exists
    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(password || 'password123', 10);

    const newUser: any = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      password: hashedPassword,
      role,
      parentOf: [],
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDatabase();

    // Create role-specific records
    if (role === 'student') {
      const studentRecord = {
        id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: newUser.id,
        name,
        classId: classId || '',
        parentId: parentId,
        studentId: studentId || `STU-${Date.now()}`,
      };
      db.students.push(studentRecord);
      // Add student to class
      if (classId) {
        const classItem = db.classes.find(c => c.id === classId);
        if (classItem && !classItem.studentIds.includes(studentRecord.id)) {
          classItem.studentIds.push(studentRecord.id);
        }
      }
    } else if (role === 'teacher') {
      const teacherRecord = {
        id: `teacher-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: newUser.id,
        name,
        subjectIds: [],
      };
      db.teachers.push(teacherRecord);
    }

    saveDatabase();

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDatabase();
  const userIndex = db.users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userId = req.params.id;
  const user = db.users[userIndex];

  // Delete related records
  if (user.role === 'student') {
    const studentIndex = db.students.findIndex(s => s.userId === userId);
    if (studentIndex !== -1) {
      const student = db.students[studentIndex];
      // Remove from class
      const classItem = db.classes.find(c => c.id === student.classId);
      if (classItem) {
        classItem.studentIds = classItem.studentIds.filter(id => id !== student.id);
      }
      // Remove related data
      db.attendance = db.attendance.filter(a => a.studentId !== student.id);
      db.grades = db.grades.filter(g => g.studentId !== student.id);
      db.submissions = db.submissions.filter(s => s.studentId !== student.id);
      db.students.splice(studentIndex, 1);
    }
  } else if (user.role === 'teacher') {
    const teacherIndex = db.teachers.findIndex(t => t.userId === userId);
    if (teacherIndex !== -1) {
      const teacher = db.teachers[teacherIndex];
      // Remove from classes
      db.classes.forEach(c => {
        c.teacherIds = c.teacherIds.filter(id => id !== teacher.id);
      });
      // Remove related data
      db.attendance = db.attendance.filter(a => a.markedBy !== teacher.id);
      db.grades = db.grades.filter(g => g.teacherId !== teacher.id);
      db.assignments = db.assignments.filter(a => a.createdBy !== teacher.id);
      db.teachers.splice(teacherIndex, 1);
    }
  }

  // Remove from announcements and messages
  db.announcements = db.announcements.filter(a => a.postedBy !== userId);
  db.messages = db.messages.filter(m => m.fromUser !== userId && m.toUser !== userId);

  // Delete user
  db.users.splice(userIndex, 1);
  saveDatabase();
  
  res.json({ message: 'User deleted successfully' });
});

export default router;

