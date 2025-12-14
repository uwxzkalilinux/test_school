import express from 'express';
import bcrypt from 'bcryptjs';
import { supabaseDb } from '../database/index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const users = await supabaseDb.getUsers();
    const usersWithoutPassword = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));
    res.json(usersWithoutPassword);
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await supabaseDb.getUserById(req.params.id);
    
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
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update user
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await supabaseDb.getUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Users can only update their own profile unless admin
    if (req.user!.id !== req.params.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, email } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    const updatedUser = await supabaseDb.updateUser(req.params.id, updates);
    
    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Create user (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role, classId, parentId, studentId, subjectIds } = req.body;

    // Check if user exists
    const existingUser = await supabaseDb.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'password123', 10);

    // Create user
    const newUser = await supabaseDb.createUser({
      name,
      email,
      password: hashedPassword,
      role,
      parentOf: [],
    });

    // Create role-specific records
    if (role === 'student') {
      await supabaseDb.createStudent({
        userId: newUser.id,
        name,
        classId: classId || '',
        parentId: parentId,
        studentId: studentId || `STU-${Date.now()}`,
      });
    } else if (role === 'teacher') {
      await supabaseDb.createTeacher({
        userId: newUser.id,
        name,
        subjectIds: subjectIds || [],
      });
    }

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await supabaseDb.getUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete related records based on role
    if (user.role === 'student') {
      const student = await supabaseDb.getStudentByUserId(user.id);
      if (student) {
        // Delete related data (Supabase CASCADE will handle most of this)
        await supabaseDb.deleteStudent(student.id);
      }
    } else if (user.role === 'teacher') {
      const teacher = await supabaseDb.getTeacherByUserId(user.id);
      if (teacher) {
        await supabaseDb.deleteTeacher(teacher.id);
      }
    }

    // Delete user (CASCADE will handle related data)
    await supabaseDb.deleteUser(req.params.id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

export default router;
