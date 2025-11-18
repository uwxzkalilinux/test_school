import express from 'express';
import { getDatabase, saveDatabase } from '../database/index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all subjects
router.get('/', authenticate, (req, res) => {
  const db = getDatabase();
  res.json(db.subjects);
});

// Get subject by ID
router.get('/:id', authenticate, (req, res) => {
  const db = getDatabase();
  const subject = db.subjects.find(s => s.id === req.params.id);
  
  if (!subject) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  res.json(subject);
});

// Create subject (Admin only)
router.post('/', authenticate, authorize('admin'), (req, res) => {
  const db = getDatabase();
  const { name, teacherId, classIds, code } = req.body;

  const newSubject = {
    id: `subject-${Date.now()}`,
    name,
    teacherId,
    classIds: classIds || [],
    code: code || name.substring(0, 3).toUpperCase(),
  };

  db.subjects.push(newSubject);
  
  // Update teacher's subjectIds
  if (teacherId) {
    const teacher = db.teachers.find(t => t.id === teacherId);
    if (teacher && !teacher.subjectIds.includes(newSubject.id)) {
      teacher.subjectIds.push(newSubject.id);
    }
  }
  
  // Update classes to include this subject's teacher
  if (teacherId && classIds && classIds.length > 0) {
    classIds.forEach((classId: string) => {
      const classItem = db.classes.find(c => c.id === classId);
      if (classItem && teacherId) {
        const teacher = db.teachers.find(t => t.id === teacherId);
        if (teacher && !classItem.teacherIds.includes(teacher.id)) {
          classItem.teacherIds.push(teacher.id);
        }
      }
    });
  }
  
  saveDatabase();
  res.status(201).json(newSubject);
});

// Update subject (Admin only)
router.put('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDatabase();
  const subjectIndex = db.subjects.findIndex(s => s.id === req.params.id);
  
  if (subjectIndex === -1) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  const { name, teacherId, classIds, code } = req.body;
  const oldSubject = { ...db.subjects[subjectIndex] };
  
  if (name) db.subjects[subjectIndex].name = name;
  if (teacherId !== undefined) {
    // Remove from old teacher
    if (oldSubject.teacherId) {
      const oldTeacher = db.teachers.find(t => t.id === oldSubject.teacherId);
      if (oldTeacher) {
        oldTeacher.subjectIds = oldTeacher.subjectIds.filter(id => id !== req.params.id);
      }
    }
    // Add to new teacher
    db.subjects[subjectIndex].teacherId = teacherId;
    if (teacherId) {
      const teacher = db.teachers.find(t => t.id === teacherId);
      if (teacher && !teacher.subjectIds.includes(req.params.id)) {
        teacher.subjectIds.push(req.params.id);
      }
    }
  }
  if (classIds !== undefined) {
    db.subjects[subjectIndex].classIds = classIds;
    // Update classes
    if (teacherId || oldSubject.teacherId) {
      const currentTeacherId = teacherId || oldSubject.teacherId;
      // Remove from old classes
      oldSubject.classIds.forEach((classId: string) => {
        const classItem = db.classes.find(c => c.id === classId);
        if (classItem && oldSubject.teacherId) {
          classItem.teacherIds = classItem.teacherIds.filter(id => id !== oldSubject.teacherId);
        }
      });
      // Add to new classes
      if (classIds && classIds.length > 0 && currentTeacherId) {
        const teacher = db.teachers.find(t => t.id === currentTeacherId);
        if (teacher) {
          classIds.forEach((classId: string) => {
            const classItem = db.classes.find(c => c.id === classId);
            if (classItem && !classItem.teacherIds.includes(teacher.id)) {
              classItem.teacherIds.push(teacher.id);
            }
          });
        }
      }
    }
  }
  if (code) db.subjects[subjectIndex].code = code;

  saveDatabase();
  res.json(db.subjects[subjectIndex]);
});

// Delete subject (Admin only)
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDatabase();
  const subjectIndex = db.subjects.findIndex(s => s.id === req.params.id);
  
  if (subjectIndex === -1) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  const subjectId = req.params.id;
  
  // Remove from teachers
  db.teachers.forEach(teacher => {
    teacher.subjectIds = teacher.subjectIds.filter(id => id !== subjectId);
  });
  
  // Remove related data
  db.attendance = db.attendance.filter(a => a.subjectId !== subjectId);
  db.grades = db.grades.filter(g => g.subjectId !== subjectId);
  db.assignments = db.assignments.filter(a => a.subjectId !== subjectId);
  db.timetable = db.timetable.filter(t => t.subjectId !== subjectId);
  db.announcements = db.announcements.filter(a => 
    !(a.targetGroup === 'subject' && a.targetIds.includes(subjectId))
  );

  db.subjects.splice(subjectIndex, 1);
  saveDatabase();
  res.json({ message: 'Subject deleted successfully' });
});

export default router;

