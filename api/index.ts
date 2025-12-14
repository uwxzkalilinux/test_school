// Vercel Serverless Function - Entry point for API
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from '../server/src/routes/auth.js';
import usersRoutes from '../server/src/routes/users.js';
import classesRoutes from '../server/src/routes/classes.js';
import subjectsRoutes from '../server/src/routes/subjects.js';
import teachersRoutes from '../server/src/routes/teachers.js';
import studentsRoutes from '../server/src/routes/students.js';
import attendanceRoutes from '../server/src/routes/attendance.js';
import gradesRoutes from '../server/src/routes/grades.js';
import assignmentsRoutes from '../server/src/routes/assignments.js';
import announcementsRoutes from '../server/src/routes/announcements.js';
import messagesRoutes from '../server/src/routes/messages.js';
import timetableRoutes from '../server/src/routes/timetable.js';
import { initDatabase } from '../server/src/database/index.js';

const app = express();

// Middleware
const frontendUrl = process.env.FRONTEND_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '*');

app.use(cors({
  origin: frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (without /api prefix since Vercel adds it via rewrite)
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/classes', classesRoutes);
app.use('/subjects', subjectsRoutes);
app.use('/teachers', teachersRoutes);
app.use('/students', studentsRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/grades', gradesRoutes);
app.use('/assignments', assignmentsRoutes);
app.use('/announcements', announcementsRoutes);
app.use('/messages', messagesRoutes);
app.use('/timetable', timetableRoutes);

// Initialize database (only once)
let dbInitialized = false;
if (!dbInitialized) {
  initDatabase().then(() => {
    dbInitialized = true;
    console.log('✅ Database initialized');
  }).catch(err => {
    console.error('❌ Database init error:', err);
  });
}

// Export for Vercel Serverless
export default app;
