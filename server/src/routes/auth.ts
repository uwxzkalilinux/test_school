import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase, saveDatabase, User } from '../database/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, parentOf } = req.body;
    const db = getDatabase();

    // Check if user exists
    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      role,
      parentOf: parentOf || [],
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDatabase();

    // Create role-specific records
    if (role === 'student') {
      db.students.push({
        id: `student-${Date.now()}`,
        userId: newUser.id,
        name,
        classId: req.body.classId || '',
        parentId: req.body.parentId,
        studentId: req.body.studentId || `STU-${Date.now()}`,
      });
    } else if (role === 'teacher') {
      db.teachers.push({
        id: `teacher-${Date.now()}`,
        userId: newUser.id,
        name,
        subjectIds: [],
      });
    }

    saveDatabase();

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDatabase();

    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticate, (req: AuthRequest, res) => {
  const db = getDatabase();
  const user = db.users.find(u => u.id === req.user!.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

export default router;

