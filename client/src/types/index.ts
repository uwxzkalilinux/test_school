export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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

