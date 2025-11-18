import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../data/db.json');
const UPLOADS_PATH = path.join(__dirname, '../../uploads');

// Ensure directories exist
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}
if (!fs.existsSync(UPLOADS_PATH)) {
  fs.mkdirSync(UPLOADS_PATH, { recursive: true });
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  parentOf?: string[]; // Array of student IDs if role is parent
  createdAt: string;
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  classId: string;
  parentId?: string;
  studentId: string; // Student ID number
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
  markedBy: string; // Teacher ID
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  examType: string; // 'exam', 'quiz', 'homework', 'activity'
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
  createdBy: string; // Teacher ID
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
  postedBy: string; // User ID
  title: string;
  body: string;
  targetGroup: 'all' | 'class' | 'subject' | 'role';
  targetIds: string[]; // Class IDs, Subject IDs, or Role names
  createdAt: string;
  attachments?: string[];
}

export interface Message {
  id: string;
  fromUser: string;
  toUser?: string; // For direct messages
  groupId?: string; // For group messages (class or subject)
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
  day: string; // 'monday', 'tuesday', etc.
  startTime: string;
  endTime: string;
  room?: string;
}

interface Database {
  users: User[];
  students: Student[];
  teachers: Teacher[];
  classes: Class[];
  subjects: Subject[];
  attendance: Attendance[];
  grades: Grade[];
  assignments: Assignment[];
  submissions: Submission[];
  announcements: Announcement[];
  messages: Message[];
  timetable: Timetable[];
}

let db: Database = {
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

export const loadDatabase = (): Database => {
  if (fs.existsSync(DB_PATH)) {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    db = JSON.parse(data);
  }
  return db;
};

export const saveDatabase = (): void => {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
};

export const getDatabase = (): Database => {
  return db;
};

export const initDatabase = async (): Promise<void> => {
  loadDatabase();
  
  let needsSave = false;
  
  // Create default admin if no admin exists
  const adminExists = db.users.find(u => u.role === 'admin' && u.email === 'admin@school.com');
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser: User = {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@school.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    db.users.push(adminUser);
    needsSave = true;
    console.log('Default admin created: admin@school.com / admin123');
  }
  
  // Create default classes
  if (db.classes.length === 0) {
    const classes: Class[] = [
      { id: 'class-1', name: 'الصف العاشر - أ', level: '10', teacherIds: [], studentIds: [] },
      { id: 'class-2', name: 'الصف العاشر - ب', level: '10', teacherIds: [], studentIds: [] },
      { id: 'class-3', name: 'الصف الحادي عشر - أ', level: '11', teacherIds: [], studentIds: [] },
      { id: 'class-4', name: 'الصف الثاني عشر - أ', level: '12', teacherIds: [], studentIds: [] },
    ];
    db.classes.push(...classes);
    needsSave = true;
    console.log('Default classes created');
  }
  
  // Create default subjects
  if (db.subjects.length === 0) {
    const subjects: Subject[] = [
      { id: 'subject-1', name: 'الرياضيات', teacherId: '', classIds: ['class-1', 'class-2'], code: 'MATH' },
      { id: 'subject-2', name: 'الفيزياء', teacherId: '', classIds: ['class-1', 'class-2'], code: 'PHY' },
      { id: 'subject-3', name: 'الكيمياء', teacherId: '', classIds: ['class-1', 'class-2'], code: 'CHEM' },
      { id: 'subject-4', name: 'اللغة العربية', teacherId: '', classIds: ['class-1', 'class-2', 'class-3'], code: 'ARAB' },
      { id: 'subject-5', name: 'اللغة الإنجليزية', teacherId: '', classIds: ['class-1', 'class-2', 'class-3'], code: 'ENG' },
      { id: 'subject-6', name: 'التاريخ', teacherId: '', classIds: ['class-3', 'class-4'], code: 'HIST' },
      { id: 'subject-7', name: 'الجغرافيا', teacherId: '', classIds: ['class-3', 'class-4'], code: 'GEO' },
    ];
    db.subjects.push(...subjects);
    needsSave = true;
    console.log('Default subjects created');
  }
  
  // Create default teachers
  if (db.teachers.length === 0 && db.users.filter(u => u.role === 'teacher').length === 0) {
    const teacherPasswords = await Promise.all([
      bcrypt.hash('teacher123', 10),
      bcrypt.hash('teacher123', 10),
      bcrypt.hash('teacher123', 10),
    ]);
    
    const teachers: User[] = [
      {
        id: 'teacher-1',
        name: 'أستاذ أحمد محمد',
        email: 'teacher1@school.com',
        password: teacherPasswords[0],
        role: 'teacher',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'teacher-2',
        name: 'أستاذة فاطمة علي',
        email: 'teacher2@school.com',
        password: teacherPasswords[1],
        role: 'teacher',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'teacher-3',
        name: 'أستاذ خالد حسن',
        email: 'teacher3@school.com',
        password: teacherPasswords[2],
        role: 'teacher',
        createdAt: new Date().toISOString(),
      },
    ];
    
    db.users.push(...teachers);
    
    // Create teacher records
    db.teachers.push(
      { id: 'teacher-rec-1', userId: 'teacher-1', name: 'أستاذ أحمد محمد', subjectIds: ['subject-1', 'subject-2'] },
      { id: 'teacher-rec-2', userId: 'teacher-2', name: 'أستاذة فاطمة علي', subjectIds: ['subject-4', 'subject-5'] },
      { id: 'teacher-rec-3', userId: 'teacher-3', name: 'أستاذ خالد حسن', subjectIds: ['subject-3', 'subject-6'] }
    );
    
    // Assign teachers to subjects
    const mathSubject = db.subjects.find(s => s.id === 'subject-1');
    const phySubject = db.subjects.find(s => s.id === 'subject-2');
    const arabSubject = db.subjects.find(s => s.id === 'subject-4');
    const engSubject = db.subjects.find(s => s.id === 'subject-5');
    const chemSubject = db.subjects.find(s => s.id === 'subject-3');
    const histSubject = db.subjects.find(s => s.id === 'subject-6');
    
    if (mathSubject) mathSubject.teacherId = 'teacher-rec-1';
    if (phySubject) phySubject.teacherId = 'teacher-rec-1';
    if (arabSubject) arabSubject.teacherId = 'teacher-rec-2';
    if (engSubject) engSubject.teacherId = 'teacher-rec-2';
    if (chemSubject) chemSubject.teacherId = 'teacher-rec-3';
    if (histSubject) histSubject.teacherId = 'teacher-rec-3';
    
    needsSave = true;
    console.log('Default teachers created: teacher1@school.com, teacher2@school.com, teacher3@school.com / password: teacher123');
  }
  
  // Create default students
  if (db.students.length === 0 && db.users.filter(u => u.role === 'student').length === 0) {
    const studentPasswords = await Promise.all([
      bcrypt.hash('student123', 10),
      bcrypt.hash('student123', 10),
      bcrypt.hash('student123', 10),
      bcrypt.hash('student123', 10),
    ]);
    
    const students: User[] = [
      {
        id: 'student-1',
        name: 'محمد علي',
        email: 'student1@school.com',
        password: studentPasswords[0],
        role: 'student',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'student-2',
        name: 'سارة أحمد',
        email: 'student2@school.com',
        password: studentPasswords[1],
        role: 'student',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'student-3',
        name: 'علي حسن',
        email: 'student3@school.com',
        password: studentPasswords[2],
        role: 'student',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'student-4',
        name: 'فاطمة خالد',
        email: 'student4@school.com',
        password: studentPasswords[3],
        role: 'student',
        createdAt: new Date().toISOString(),
      },
    ];
    
    db.users.push(...students);
    
    // Create student records and add to classes
    const studentRecords: Student[] = [
      { id: 'student-rec-1', userId: 'student-1', name: 'محمد علي', classId: 'class-1', studentId: 'STU-001' },
      { id: 'student-rec-2', userId: 'student-2', name: 'سارة أحمد', classId: 'class-1', studentId: 'STU-002' },
      { id: 'student-rec-3', userId: 'student-3', name: 'علي حسن', classId: 'class-2', studentId: 'STU-003' },
      { id: 'student-rec-4', userId: 'student-4', name: 'فاطمة خالد', classId: 'class-2', studentId: 'STU-004' },
    ];
    
    db.students.push(...studentRecords);
    
    // Add students to classes
    const class1 = db.classes.find(c => c.id === 'class-1');
    const class2 = db.classes.find(c => c.id === 'class-2');
    if (class1) {
      if (!class1.studentIds.includes('student-rec-1')) class1.studentIds.push('student-rec-1');
      if (!class1.studentIds.includes('student-rec-2')) class1.studentIds.push('student-rec-2');
    }
    if (class2) {
      if (!class2.studentIds.includes('student-rec-3')) class2.studentIds.push('student-rec-3');
      if (!class2.studentIds.includes('student-rec-4')) class2.studentIds.push('student-rec-4');
    }
    
    // Add teachers to classes based on subjects
    const teacher1 = db.teachers.find(t => t.id === 'teacher-rec-1');
    const teacher2 = db.teachers.find(t => t.id === 'teacher-rec-2');
    const teacher3 = db.teachers.find(t => t.id === 'teacher-rec-3');
    
    // Teacher 1 teaches math and physics to class-1 and class-2
    if (teacher1 && class1 && !class1.teacherIds.includes('teacher-rec-1')) {
      class1.teacherIds.push('teacher-rec-1');
    }
    if (teacher1 && class2 && !class2.teacherIds.includes('teacher-rec-1')) {
      class2.teacherIds.push('teacher-rec-1');
    }
    
    // Teacher 2 teaches Arabic and English to class-1, class-2, class-3
    if (teacher2 && class1 && !class1.teacherIds.includes('teacher-rec-2')) {
      class1.teacherIds.push('teacher-rec-2');
    }
    if (teacher2 && class2 && !class2.teacherIds.includes('teacher-rec-2')) {
      class2.teacherIds.push('teacher-rec-2');
    }
    const class3 = db.classes.find(c => c.id === 'class-3');
    if (teacher2 && class3 && !class3.teacherIds.includes('teacher-rec-2')) {
      class3.teacherIds.push('teacher-rec-2');
    }
    
    // Teacher 3 teaches chemistry and history
    if (teacher3 && class1 && !class1.teacherIds.includes('teacher-rec-3')) {
      class1.teacherIds.push('teacher-rec-3');
    }
    if (teacher3 && class2 && !class2.teacherIds.includes('teacher-rec-3')) {
      class2.teacherIds.push('teacher-rec-3');
    }
    if (teacher3 && class3 && !class3.teacherIds.includes('teacher-rec-3')) {
      class3.teacherIds.push('teacher-rec-3');
    }
    const class4 = db.classes.find(c => c.id === 'class-4');
    if (teacher3 && class4 && !class4.teacherIds.includes('teacher-rec-3')) {
      class4.teacherIds.push('teacher-rec-3');
    }
    
    needsSave = true;
    console.log('Default students created: student1@school.com, student2@school.com, student3@school.com, student4@school.com / password: student123');
  }
  
  // Create default parent
  if (db.users.filter(u => u.role === 'parent').length === 0) {
    const parentPassword = await bcrypt.hash('parent123', 10);
    const parentUser: User = {
      id: 'parent-1',
      name: 'والد محمد علي',
      email: 'parent1@school.com',
      password: parentPassword,
      role: 'parent',
      parentOf: ['student-rec-1'],
      createdAt: new Date().toISOString(),
    };
    db.users.push(parentUser);
    needsSave = true;
    console.log('Default parent created: parent1@school.com / password: parent123');
  }
  
  if (needsSave) {
    saveDatabase();
  }
};

export default db;

