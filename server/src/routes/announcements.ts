import express from 'express';
import { getDatabase, saveDatabase } from '../database/index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get announcements
router.get('/', authenticate, (req: AuthRequest, res) => {
  const db = getDatabase();
  let announcements = db.announcements;

  // Filter based on role and target group
  if (req.user!.role !== 'admin') {
    announcements = announcements.filter(a => {
      if (a.targetGroup === 'all') return true;
      if (a.targetGroup === 'role' && a.targetIds.includes(req.user!.role)) return true;
      
      if (req.user!.role === 'student') {
        const student = db.students.find(s => s.userId === req.user!.id);
        if (student) {
          if (a.targetGroup === 'class' && a.targetIds.includes(student.classId)) return true;
          if (a.targetGroup === 'subject') {
            const classItem = db.classes.find(c => c.id === student.classId);
            if (classItem) {
              const subjectIds = db.subjects
                .filter(s => s.classIds.includes(student.classId))
                .map(s => s.id);
              return a.targetIds.some(id => subjectIds.includes(id));
            }
          }
        }
      } else if (req.user!.role === 'teacher') {
        const teacher = db.teachers.find(t => t.userId === req.user!.id);
        if (teacher) {
          if (a.targetGroup === 'subject' && a.targetIds.some(id => teacher.subjectIds.includes(id))) return true;
        }
      } else if (req.user!.role === 'parent') {
        const user = db.users.find(u => u.id === req.user!.id);
        if (user?.parentOf) {
          const studentIds = db.students
            .filter(s => user.parentOf!.includes(s.id))
            .map(s => s.id);
          const classIds = db.students
            .filter(s => studentIds.includes(s.id))
            .map(s => s.classId);
          if (a.targetGroup === 'class' && a.targetIds.some(id => classIds.includes(id))) return true;
        }
      }
      return false;
    });
  }

  res.json(announcements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

// Get announcement by ID
router.get('/:id', authenticate, (req, res) => {
  const db = getDatabase();
  const announcement = db.announcements.find(a => a.id === req.params.id);
  
  if (!announcement) {
    return res.status(404).json({ error: 'Announcement not found' });
  }

  res.json(announcement);
});

// Create announcement
router.post('/', authenticate, (req: AuthRequest, res) => {
  const db = getDatabase();
  const { title, body, targetGroup, targetIds } = req.body;

  // Only admin can post to 'all', teachers can post to their classes/subjects
  if (targetGroup === 'all' && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Only admin can post to all' });
  }

  const newAnnouncement = {
    id: `announcement-${Date.now()}`,
    postedBy: req.user!.id,
    title,
    body,
    targetGroup: targetGroup || 'all',
    targetIds: targetIds || [],
    createdAt: new Date().toISOString(),
    attachments: [],
  };

  db.announcements.push(newAnnouncement);
  saveDatabase();
  res.status(201).json(newAnnouncement);
});

// Update announcement (only by creator or admin)
router.put('/:id', authenticate, (req: AuthRequest, res) => {
  const db = getDatabase();
  const announcementIndex = db.announcements.findIndex(a => a.id === req.params.id);
  
  if (announcementIndex === -1) {
    return res.status(404).json({ error: 'Announcement not found' });
  }

  const announcement = db.announcements[announcementIndex];
  if (announcement.postedBy !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { title, body, targetGroup, targetIds } = req.body;
  if (title) db.announcements[announcementIndex].title = title;
  if (body) db.announcements[announcementIndex].body = body;
  if (targetGroup) db.announcements[announcementIndex].targetGroup = targetGroup;
  if (targetIds) db.announcements[announcementIndex].targetIds = targetIds;

  saveDatabase();
  res.json(db.announcements[announcementIndex]);
});

// Delete announcement (only by creator or admin)
router.delete('/:id', authenticate, (req: AuthRequest, res) => {
  const db = getDatabase();
  const announcementIndex = db.announcements.findIndex(a => a.id === req.params.id);
  
  if (announcementIndex === -1) {
    return res.status(404).json({ error: 'Announcement not found' });
  }

  const announcement = db.announcements[announcementIndex];
  if (announcement.postedBy !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.announcements.splice(announcementIndex, 1);
  saveDatabase();
  res.json({ message: 'Announcement deleted' });
});

export default router;

