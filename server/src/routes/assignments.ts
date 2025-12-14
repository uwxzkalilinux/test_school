import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { supabaseDb } from '../database/index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/assignments');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const router = express.Router();

// Get assignments
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    let assignments = await supabaseDb.getAssignments();

    // Filter based on role
    if (req.user!.role === 'student') {
      const student = await supabaseDb.getStudentByUserId(req.user!.id);
      if (student) {
        const classItem = await supabaseDb.getClassById(student.classId);
        if (classItem) {
          const subjects = await supabaseDb.getSubjects();
          const subjectIds = subjects
            .filter(s => s.classIds.includes(student.classId))
            .map(s => s.id);
          assignments = assignments.filter(a => subjectIds.includes(a.subjectId));
        }
      }
    } else if (req.user!.role === 'teacher') {
      const teacher = await supabaseDb.getTeacherByUserId(req.user!.id);
      if (teacher) {
        const subjectIds = teacher.subjectIds;
        assignments = assignments.filter(a => subjectIds.includes(a.subjectId));
      }
    }

    res.json(assignments);
  } catch (error: any) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Create assignment (Teacher only)
router.post('/', authenticate, authorize('teacher'), upload.array('attachments', 5), async (req: AuthRequest, res) => {
  try {
    const { subjectId, title, description, dueDate } = req.body;

    if (!subjectId || !title || !dueDate) {
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

    const attachments = req.files ? (req.files as Express.Multer.File[]).map(f => `/uploads/assignments/${f.filename}`) : [];

    const newAssignment = await supabaseDb.createAssignment({
      subjectId,
      title,
      description: description || '',
      dueDate,
      createdBy: teacher.id,
      attachments,
    });

    res.status(201).json(newAssignment);
  } catch (error: any) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: error.message || 'خطأ في الخادم' });
  }
});

// Get submissions for an assignment (must be before /:id)
router.get('/:id/submissions', authenticate, async (req, res) => {
  try {
    const submissions = await supabaseDb.getSubmissions();
    const filtered = submissions.filter(s => s.assignmentId === req.params.id);
    res.json(filtered);
  } catch (error: any) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Submit assignment (Student only) (must be before /:id)
router.post('/:id/submit', authenticate, authorize('student'), upload.single('file'), async (req: AuthRequest, res) => {
  try {
    const assignment = await supabaseDb.getAssignmentById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ error: 'الواجب غير موجود' });
    }

    const student = await supabaseDb.getStudentByUserId(req.user!.id);
    if (!student) {
      return res.status(404).json({ error: 'الطالب غير موجود' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'لم يتم رفع ملف' });
    }

    const newSubmission = await supabaseDb.createSubmission({
      assignmentId: req.params.id,
      studentId: student.id,
      fileUrl: `/uploads/assignments/${req.file.filename}`,
    });

    res.status(201).json(newSubmission);
  } catch (error: any) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete assignment (Teacher only) (must be before GET /:id)
router.delete('/:id', authenticate, authorize('teacher'), async (req: AuthRequest, res) => {
  try {
    const assignment = await supabaseDb.getAssignmentById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ error: 'الواجب غير موجود' });
    }

    const teacher = await supabaseDb.getTeacherByUserId(req.user!.id);
    
    if (!teacher || assignment.createdBy !== teacher.id) {
      return res.status(403).json({ error: 'غير مصرح لك بحذف هذا الواجب' });
    }

    await supabaseDb.deleteAssignment(req.params.id);
    res.json({ message: 'تم حذف الواجب بنجاح' });
  } catch (error: any) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: error.message || 'خطأ في الخادم' });
  }
});

// Get assignment by ID (must be last)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const assignment = await supabaseDb.getAssignmentById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ error: 'الواجب غير موجود' });
    }

    res.json(assignment);
  } catch (error: any) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Grade submission (Teacher only)
router.put('/submissions/:id/grade', authenticate, authorize('teacher'), async (req: AuthRequest, res) => {
  try {
    const { grade, feedback } = req.body;
    const updates: any = {};
    
    if (grade !== undefined) updates.grade = grade;
    if (feedback !== undefined) updates.feedback = feedback;

    const teacher = await supabaseDb.getTeacherByUserId(req.user!.id);
    if (teacher) {
      updates.gradedBy = teacher.id;
    }

    const updatedSubmission = await supabaseDb.updateSubmission(req.params.id, updates);
    res.json(updatedSubmission);
  } catch (error: any) {
    console.error('Grade submission error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

export default router;
