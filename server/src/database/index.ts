// Database types and Supabase integration
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_PATH = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_PATH)) {
  fs.mkdirSync(UPLOADS_PATH, { recursive: true });
}

// Import Supabase database
import { db as supabaseDb } from './supabase.js';

// Export all types
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  parentOf?: string[];
  createdAt: string;
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  classId: string;
  parentId?: string;
  studentId: string;
}

export interface Teacher {
  id: string;
  userId: string;
  name: string;
  subjectIds: string[];
}

export interface Class {
  id: string;
  name: string;
  level: string;
  teacherIds: string[];
  studentIds: string[];
}

export interface Subject {
  id: string;
  name: string;
  teacherId: string;
  classIds: string[];
  code: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  markedBy: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  examType: string;
  score: number;
  maxScore: number;
  date: string;
  teacherId: string;
  comments?: string;
}

export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  createdBy: string;
  attachments?: string[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  fileUrl: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  gradedBy?: string;
}

export interface Announcement {
  id: string;
  postedBy: string;
  title: string;
  body: string;
  targetGroup: 'all' | 'class' | 'subject' | 'role';
  targetIds: string[];
  createdAt: string;
  attachments?: string[];
}

export interface Message {
  id: string;
  fromUser: string;
  toUser?: string;
  groupId?: string;
  groupType?: 'class' | 'subject';
  body: string;
  date: string;
  read: boolean;
  attachments?: string[];
}

export interface Timetable {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
}

// Compatibility functions for old code
export const getDatabase = () => {
  return {
    users: [],
    students: [],
    teachers: [],
    classes: [],
    subjects: [],
    attendance: [],
    grades: [],
    assignments: [],
    submissions: [],
    announcements: [],
    messages: [],
    timetable: [],
  };
};

export const saveDatabase = (): void => {
  // No-op: Supabase saves automatically
};

export const initDatabase = async (): Promise<void> => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️  Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file');
    return;
  }
  
  try {
    const adminUser = await supabaseDb.getUserByEmail('admin@school.com');
    if (!adminUser) {
      console.log('✅ Supabase database initialized. Default data should be loaded from SQL schema.');
      console.log('✅ If you haven\'t run supabase_schema.sql yet, please do so in Supabase SQL Editor.');
    } else {
      console.log('✅ Supabase database connected successfully!');
    }
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error);
    console.warn('⚠️  Make sure you have run supabase_schema.sql in Supabase SQL Editor');
  }
};

// Export Supabase db as default and named export
export { supabaseDb as db };
export { supabaseDb };
