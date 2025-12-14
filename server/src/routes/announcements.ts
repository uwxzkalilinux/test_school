import express from 'express';
import { supabaseDb } from '../database/index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get announcements
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    let announcements = await supabaseDb.getAnnouncements();

    // Filter based on role and target group
    if (req.user!.role !== 'admin') {
      announcements = announcements.filter(async (a) => {
        if (a.targetGroup === 'all') return true;
        if (a.targetGroup === 'role' && a.targetIds.includes(req.user!.role)) return true;
        
        if (req.user!.role === 'student') {
          const student = await supabaseDb.getStudentByUserId(req.user!.id);
          if (student) {
            if (a.targetGroup === 'class' && a.targetIds.includes(student.classId)) return true;
            if (a.targetGroup === 'subject') {
              const subjects = await supabaseDb.getSubjects();
              const subjectIds = subjects
                .filter(s => s.classIds.includes(student.classId))
                .map(s => s.id);
              return a.targetIds.some(id => subjectIds.includes(id));
            }
          }
        } else if (req.user!.role === 'teacher') {
          const teacher = await supabaseDb.getTeacherByUserId(req.user!.id);
          if (teacher) {
            if (a.targetGroup === 'subject' && a.targetIds.some(id => teacher.subjectIds.includes(id))) return true;
          }
        } else if (req.user!.role === 'parent') {
          const user = await supabaseDb.getUserById(req.user!.id);
          if (user?.parentOf) {
            const students = await supabaseDb.getStudents();
            const studentIds = students
              .filter(s => user.parentOf!.includes(s.id))
              .map(s => s.id);
            const classIds = students
              .filter(s => studentIds.includes(s.id))
              .map(s => s.classId);
            if (a.targetGroup === 'class' && a.targetIds.some(id => classIds.includes(id))) return true;
          }
        }
        return false;
      });
    }

    res.json(announcements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (error: any) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get announcement by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const announcement = await supabaseDb.getAnnouncementById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(announcement);
  } catch (error: any) {
    console.error('Get announcement error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Create announcement
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, body, targetGroup, targetIds } = req.body;

    // Only admin can post to 'all', teachers can post to their classes/subjects
    if (targetGroup === 'all' && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can post to all' });
    }

    const newAnnouncement = await supabaseDb.createAnnouncement({
      postedBy: req.user!.id,
      title,
      body,
      targetGroup: targetGroup || 'all',
      targetIds: targetIds || [],
      attachments: [],
    });

    res.status(201).json(newAnnouncement);
  } catch (error: any) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update announcement (only by creator or admin)
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const announcement = await supabaseDb.getAnnouncementById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    if (announcement.postedBy !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { title, body, targetGroup, targetIds } = req.body;
    const updates: any = {};
    
    if (title) updates.title = title;
    if (body) updates.body = body;
    if (targetGroup) updates.targetGroup = targetGroup;
    if (targetIds) updates.targetIds = targetIds;

    const updatedAnnouncement = await supabaseDb.updateAnnouncement(req.params.id, updates);
    res.json(updatedAnnouncement);
  } catch (error: any) {
    console.error('Update announcement error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete announcement (only by creator or admin)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const announcement = await supabaseDb.getAnnouncementById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    if (announcement.postedBy !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await supabaseDb.deleteAnnouncement(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (error: any) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

export default router;
