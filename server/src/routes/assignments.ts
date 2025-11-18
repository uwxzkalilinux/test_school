import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDatabase, saveDatabase } from '../database/index.js';
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
router.get('/', authenticate, (req: AuthRequest, res) => {
  const db = getDatabase();
  let assignments = db.assignments;

  // Filter based on role
  if (req.user!.role === 'student') {
    const student = db.students.find(s => s.userId === req.user!.id);
    if (student) {
      const classItem = db.classes.find(c => c.id === student.classId);
      if (classItem) {
        const subjectIds = db.subjects
          .filter(s => s.classIds.includes(student.classId))
          .map(s => s.id);
        assignments = assignments.filter(a => subjectIds.includes(a.subjectId));
      }
    }
  } else if (req.user!.role === 'teacher') {
    const teacher = db.teachers.find(t => t.userId === req.user!.id);
    if (teacher) {
      const subjectIds = teacher.subjectIds;
      assignments = assignments.filter(a => subjectIds.includes(a.subjectId));
    }
  }

  res.json(assignments);
});

// Create assignment (Teacher only)
router.post('/', authenticate, authorize('teacher'), upload.array('attachments', 5), (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const { subjectId, title, description, dueDate } = req.body;

    if (!subjectId || !title || !dueDate) {
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

    const attachments = req.files ? (req.files as Express.Multer.File[]).map(f => `/uploads/assignments/${f.filename}`) : [];

    const newAssignment = {
      id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      subjectId,
      title,
      description: description || '',
      dueDate,
      createdAt: new Date().toISOString(),
      createdBy: teacher.id,
      attachments,
    };

    db.assignments.push(newAssignment);
    saveDatabase();
    res.status(201).json(newAssignment);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'خطأ في الخادم' });
  }
});

// Get submissions for an assignment (must be before /:id)
router.get('/:id/submissions', authenticate, (req, res) => {
  const db = getDatabase();
  const submissions = db.submissions.filter(s => s.assignmentId === req.params.id);
  res.json(submissions);
});

// Submit assignment (Student only) (must be before /:id)
router.post('/:id/submit', authenticate, authorize('student'), upload.single('file'), (req: AuthRequest, res) => {
  const db = getDatabase();
  const assignment = db.assignments.find(a => a.id === req.params.id);
  
  if (!assignment) {
    return res.status(404).json({ error: 'الواجب غير موجود' });
  }

  const student = db.students.find(s => s.userId === req.user!.id);
  if (!student) {
    return res.status(404).json({ error: 'الطالب غير موجود' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'لم يتم رفع ملف' });
  }

  const newSubmission = {
    id: `submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    assignmentId: req.params.id,
    studentId: student.id,
    fileUrl: `/uploads/assignments/${req.file.filename}`,
    submittedAt: new Date().toISOString(),
  };

  db.submissions.push(newSubmission);
  saveDatabase();
  res.status(201).json(newSubmission);
});

// Delete assignment (Teacher only) (must be before GET /:id)
router.delete('/:id', authenticate, authorize('teacher'), (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const assignmentIndex = db.assignments.findIndex(a => a.id === req.params.id);
    
    if (assignmentIndex === -1) {
      return res.status(404).json({ error: 'الواجب غير موجود' });
    }

    const assignment = db.assignments[assignmentIndex];
    const teacher = db.teachers.find(t => t.userId === req.user!.id);
    
    if (!teacher || assignment.createdBy !== teacher.id) {
      return res.status(403).json({ error: 'غير مصرح لك بحذف هذا الواجب' });
    }

    // Delete related submissions
    db.submissions = db.submissions.filter(s => s.assignmentId !== req.params.id);
    
    db.assignments.splice(assignmentIndex, 1);
    saveDatabase();
    res.json({ message: 'تم حذف الواجب بنجاح' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'خطأ في الخادم' });
  }
});

// Get assignment by ID (must be last)
router.get('/:id', authenticate, (req, res) => {
  const db = getDatabase();
  const assignment = db.assignments.find(a => a.id === req.params.id);
  
  if (!assignment) {
    return res.status(404).json({ error: 'الواجب غير موجود' });
  }

  res.json(assignment);
});

// Grade submission (Teacher only)
router.put('/submissions/:id/grade', authenticate, authorize('teacher'), (req: AuthRequest, res) => {
  const db = getDatabase();
  const submissionIndex = db.submissions.findIndex(s => s.id === req.params.id);
  
  if (submissionIndex === -1) {
    return res.status(404).json({ error: 'التسليم غير موجود' });
  }

  const teacher = db.teachers.find(t => t.userId === req.user!.id);
  if (!teacher) {
    return res.status(404).json({ error: 'المعلم غير موجود' });
  }

  const { grade, feedback } = req.body;
  if (grade !== undefined) db.submissions[submissionIndex].grade = grade;
  if (feedback !== undefined) db.submissions[submissionIndex].feedback = feedback;
  db.submissions[submissionIndex].gradedBy = teacher.id;

  saveDatabase();
  res.json(db.submissions[submissionIndex]);
});

export default router;
