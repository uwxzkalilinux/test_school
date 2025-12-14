import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import type { 
  User, Student, Teacher, Class, Subject, 
  Attendance, Grade, Assignment, Submission, 
  Announcement, Message, Timetable 
} from './index';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('⚠️  Supabase credentials missing! Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error('⚠️  Make sure you have created server/.env file with the required variables');
}

// Create Supabase client with service role key (full access)
// Only create if we have valid credentials
let supabaseClient: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseServiceKey) {
  supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  console.error('❌ Cannot create Supabase client: Missing credentials');
  // Create a dummy client to prevent errors (will fail on actual use)
  supabaseClient = createClient('https://dummy.supabase.co', 'dummy-key', {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export const supabase = supabaseClient;

// Helper function to convert database row to our interface format
const mapUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  password: row.password,
  role: row.role,
  parentOf: row.parent_of || [],
  createdAt: row.created_at,
});

const mapStudent = (row: any): Student => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  classId: row.class_id,
  parentId: row.parent_id,
  studentId: row.student_id,
});

const mapTeacher = async (row: any): Promise<Teacher> => {
  // Get subject IDs from teacher_subjects junction table
  const { data: teacherSubjects } = await supabase
    .from('teacher_subjects')
    .select('subject_id')
    .eq('teacher_id', row.id);
  
  const subjectIds = teacherSubjects?.map(ts => ts.subject_id) || [];
  
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    subjectIds,
  };
};

const mapClass = async (row: any): Promise<Class> => {
  // Get student IDs
  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('class_id', row.id);
  
  const studentIds = students?.map(s => s.id) || [];
  
  // Get teacher IDs from subjects taught in this class
  const { data: subjectClasses } = await supabase
    .from('subject_classes')
    .select('subject_id')
    .eq('class_id', row.id);
  
  const subjectIds = subjectClasses?.map(sc => sc.subject_id) || [];
  
  const teacherIds: string[] = [];
  if (subjectIds.length > 0) {
    const { data: teacherSubjects } = await supabase
      .from('teacher_subjects')
      .select('teacher_id')
      .in('subject_id', subjectIds);
    
    const uniqueTeacherIds = [...new Set(teacherSubjects?.map(ts => ts.teacher_id) || [])];
    teacherIds.push(...uniqueTeacherIds);
  }
  
  return {
    id: row.id,
    name: row.name,
    level: row.level,
    teacherIds,
    studentIds,
  };
};

const mapSubject = async (row: any): Promise<Subject> => {
  // Get teacher ID from teacher_subjects (first teacher)
  const { data: teacherSubjects } = await supabase
    .from('teacher_subjects')
    .select('teacher_id')
    .eq('subject_id', row.id)
    .limit(1);
  
  const teacherId = teacherSubjects?.[0]?.teacher_id || '';
  
  // Get class IDs from subject_classes
  const { data: subjectClasses } = await supabase
    .from('subject_classes')
    .select('class_id')
    .eq('subject_id', row.id);
  
  const classIds = subjectClasses?.map(sc => sc.class_id) || [];
  
  return {
    id: row.id,
    name: row.name,
    teacherId,
    classIds,
    code: row.code,
  };
};

const mapAttendance = (row: any): Attendance => ({
  id: row.id,
  studentId: row.student_id,
  subjectId: row.subject_id,
  classId: row.class_id,
  date: row.date,
  status: row.status,
  markedBy: row.marked_by,
});

const mapGrade = (row: any): Grade => ({
  id: row.id,
  studentId: row.student_id,
  subjectId: row.subject_id,
  examType: row.exam_type,
  score: parseFloat(row.score),
  maxScore: parseFloat(row.max_score),
  date: row.date,
  teacherId: row.teacher_id,
  comments: row.comments,
});

const mapAssignment = (row: any): Assignment => ({
  id: row.id,
  subjectId: row.subject_id,
  title: row.title,
  description: row.description,
  dueDate: row.due_date,
  createdAt: row.created_at,
  createdBy: row.created_by,
  attachments: row.attachments || [],
});

const mapSubmission = (row: any): Submission => ({
  id: row.id,
  assignmentId: row.assignment_id,
  studentId: row.student_id,
  fileUrl: row.file_url,
  submittedAt: row.submitted_at,
  grade: row.grade ? parseFloat(row.grade) : undefined,
  feedback: row.feedback,
  gradedBy: row.graded_by,
});

const mapAnnouncement = (row: any): Announcement => ({
  id: row.id,
  postedBy: row.posted_by,
  title: row.title,
  body: row.body,
  targetGroup: row.target_group,
  targetIds: row.target_ids || [],
  createdAt: row.created_at,
  attachments: row.attachments || [],
});

const mapMessage = (row: any): Message => ({
  id: row.id,
  fromUser: row.from_user,
  toUser: row.to_user,
  groupId: row.group_id,
  groupType: row.group_type,
  body: row.body,
  date: row.date,
  read: row.read,
  attachments: row.attachments || [],
});

const mapTimetable = (row: any): Timetable => ({
  id: row.id,
  classId: row.class_id,
  subjectId: row.subject_id,
  teacherId: row.teacher_id,
  day: row.day,
  startTime: row.start_time,
  endTime: row.end_time,
  room: row.room,
});

// Database operations
export const db = {
  // Users
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(mapUser) || [];
  },

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data ? mapUser(data) : null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? mapUser(data) : null;
  },

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        parent_of: user.parentOf || [],
      })
      .select()
      .single();
    
    if (error) throw error;
    return mapUser(data);
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.password) updateData.password = updates.password;
    if (updates.role) updateData.role = updates.role;
    if (updates.parentOf !== undefined) updateData.parent_of = updates.parentOf;
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapUser(data);
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Students
  async getStudents(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*');
    
    if (error) throw error;
    return data?.map(mapStudent) || [];
  },

  async getStudentById(id: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? mapStudent(data) : null;
  },

  async getStudentByUserId(userId: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? mapStudent(data) : null;
  },

  async getStudentsByClassId(classId: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId);
    
    if (error) throw error;
    return data?.map(mapStudent) || [];
  },

  async createStudent(student: Omit<Student, 'id'>): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .insert({
        user_id: student.userId,
        name: student.name,
        class_id: student.classId,
        parent_id: student.parentId,
        student_id: student.studentId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return mapStudent(data);
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.classId) updateData.class_id = updates.classId;
    if (updates.parentId !== undefined) updateData.parent_id = updates.parentId;
    if (updates.studentId) updateData.student_id = updates.studentId;
    
    const { data, error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapStudent(data);
  },

  async deleteStudent(id: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Teachers
  async getTeachers(): Promise<Teacher[]> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*');
    
    if (error) throw error;
    return Promise.all((data || []).map(mapTeacher));
  },

  async getTeacherById(id: string): Promise<Teacher | null> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? await mapTeacher(data) : null;
  },

  async getTeacherByUserId(userId: string): Promise<Teacher | null> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? await mapTeacher(data) : null;
  },

  async createTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher> {
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .insert({
        user_id: teacher.userId,
        name: teacher.name,
      })
      .select()
      .single();
    
    if (teacherError) throw teacherError;
    
    // Link teacher to subjects
    if (teacher.subjectIds && teacher.subjectIds.length > 0) {
      const teacherSubjects = teacher.subjectIds.map(subjectId => ({
        teacher_id: teacherData.id,
        subject_id: subjectId,
      }));
      
      const { error: linkError } = await supabase
        .from('teacher_subjects')
        .insert(teacherSubjects);
      
      if (linkError) throw linkError;
    }
    
    return await mapTeacher(teacherData);
  },

  async updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher> {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('teachers')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    }
    
    // Update subject links if provided
    if (updates.subjectIds) {
      // Delete existing links
      await supabase
        .from('teacher_subjects')
        .delete()
        .eq('teacher_id', id);
      
      // Add new links
      if (updates.subjectIds.length > 0) {
        const teacherSubjects = updates.subjectIds.map(subjectId => ({
          teacher_id: id,
          subject_id: subjectId,
        }));
        
        const { error } = await supabase
          .from('teacher_subjects')
          .insert(teacherSubjects);
        
        if (error) throw error;
      }
    }
    
    const { data } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', id)
      .single();
    
    return await mapTeacher(data);
  },

  async deleteTeacher(id: string): Promise<void> {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Classes
  async getClasses(): Promise<Class[]> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('level', { ascending: true });
    
    if (error) throw error;
    return Promise.all((data || []).map(mapClass));
  },

  async getClassById(id: string): Promise<Class | null> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? await mapClass(data) : null;
  },

  async createClass(classData: Omit<Class, 'id' | 'teacherIds' | 'studentIds'>): Promise<Class> {
    const { data, error } = await supabase
      .from('classes')
      .insert({
        name: classData.name,
        level: classData.level,
      })
      .select()
      .single();
    
    if (error) throw error;
    return await mapClass(data);
  },

  async updateClass(id: string, updates: Partial<Class>): Promise<Class> {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.level) updateData.level = updates.level;
    
    const { data, error } = await supabase
      .from('classes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return await mapClass(data);
  },

  async deleteClass(id: string): Promise<void> {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return Promise.all((data || []).map(mapSubject));
  },

  async getSubjectById(id: string): Promise<Subject | null> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? await mapSubject(data) : null;
  },

  async createSubject(subject: Omit<Subject, 'id' | 'teacherId' | 'classIds'> & { teacherId?: string; classIds?: string[] }): Promise<Subject> {
    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .insert({
        name: subject.name,
        code: subject.code,
      })
      .select()
      .single();
    
    if (subjectError) throw subjectError;
    
    // Link teacher if provided
    if (subject.teacherId) {
      const { error: linkError } = await supabase
        .from('teacher_subjects')
        .insert({
          teacher_id: subject.teacherId,
          subject_id: subjectData.id,
        });
      
      if (linkError) throw linkError;
    }
    
    // Link classes if provided
    if (subject.classIds && subject.classIds.length > 0) {
      const subjectClasses = subject.classIds.map(classId => ({
        subject_id: subjectData.id,
        class_id: classId,
      }));
      
      const { error: linkError } = await supabase
        .from('subject_classes')
        .insert(subjectClasses);
      
      if (linkError) throw linkError;
    }
    
    return await mapSubject(subjectData);
  },

  async updateSubject(id: string, updates: Partial<Subject> & { teacherId?: string; classIds?: string[] }): Promise<Subject> {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.code) updateData.code = updates.code;
    
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('subjects')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    }
    
    // Update teacher link if provided
    if (updates.teacherId !== undefined) {
      // Delete existing teacher links
      await supabase
        .from('teacher_subjects')
        .delete()
        .eq('subject_id', id);
      
      // Add new teacher link
      if (updates.teacherId) {
        const { error } = await supabase
          .from('teacher_subjects')
          .insert({
            teacher_id: updates.teacherId,
            subject_id: id,
          });
        
        if (error) throw error;
      }
    }
    
    // Update class links if provided
    if (updates.classIds !== undefined) {
      // Delete existing class links
      await supabase
        .from('subject_classes')
        .delete()
        .eq('subject_id', id);
      
      // Add new class links
      if (updates.classIds.length > 0) {
        const subjectClasses = updates.classIds.map(classId => ({
          subject_id: id,
          class_id: classId,
        }));
        
        const { error } = await supabase
          .from('subject_classes')
          .insert(subjectClasses);
        
        if (error) throw error;
      }
    }
    
    const { data } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();
    
    return await mapSubject(data);
  },

  async deleteSubject(id: string): Promise<void> {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Attendance
  async getAttendance(): Promise<Attendance[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data?.map(mapAttendance) || [];
  },

  async getAttendanceByStudent(studentId: string): Promise<Attendance[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data?.map(mapAttendance) || [];
  },

  async createAttendance(attendance: Omit<Attendance, 'id'>): Promise<Attendance> {
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        student_id: attendance.studentId,
        subject_id: attendance.subjectId,
        class_id: attendance.classId,
        date: attendance.date,
        status: attendance.status,
        marked_by: attendance.markedBy,
      })
      .select()
      .single();
    
    if (error) throw error;
    return mapAttendance(data);
  },

  async updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance> {
    const updateData: any = {};
    if (updates.status) updateData.status = updates.status;
    if (updates.date) updateData.date = updates.date;
    
    const { data, error } = await supabase
      .from('attendance')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapAttendance(data);
  },

  async deleteAttendance(id: string): Promise<void> {
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Grades
  async getGrades(): Promise<Grade[]> {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data?.map(mapGrade) || [];
  },

  async getGradesByStudent(studentId: string): Promise<Grade[]> {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data?.map(mapGrade) || [];
  },

  async createGrade(grade: Omit<Grade, 'id'>): Promise<Grade> {
    const { data, error } = await supabase
      .from('grades')
      .insert({
        student_id: grade.studentId,
        subject_id: grade.subjectId,
        exam_type: grade.examType,
        score: grade.score,
        max_score: grade.maxScore,
        date: grade.date,
        teacher_id: grade.teacherId,
        comments: grade.comments,
      })
      .select()
      .single();
    
    if (error) throw error;
    return mapGrade(data);
  },

  async updateGrade(id: string, updates: Partial<Grade>): Promise<Grade> {
    const updateData: any = {};
    if (updates.score !== undefined) updateData.score = updates.score;
    if (updates.maxScore !== undefined) updateData.max_score = updates.maxScore;
    if (updates.examType) updateData.exam_type = updates.examType;
    if (updates.date) updateData.date = updates.date;
    if (updates.comments !== undefined) updateData.comments = updates.comments;
    
    const { data, error } = await supabase
      .from('grades')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapGrade(data);
  },

  async deleteGrade(id: string): Promise<void> {
    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Assignments
  async getAssignments(): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(mapAssignment) || [];
  },

  async getAssignmentById(id: string): Promise<Assignment | null> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? mapAssignment(data) : null;
  },

  async createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt'>): Promise<Assignment> {
    const { data, error } = await supabase
      .from('assignments')
      .insert({
        subject_id: assignment.subjectId,
        title: assignment.title,
        description: assignment.description,
        due_date: assignment.dueDate,
        created_by: assignment.createdBy,
        attachments: assignment.attachments || [],
      })
      .select()
      .single();
    
    if (error) throw error;
    return mapAssignment(data);
  },

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment> {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.dueDate) updateData.due_date = updates.dueDate;
    if (updates.attachments) updateData.attachments = updates.attachments;
    
    const { data, error } = await supabase
      .from('assignments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapAssignment(data);
  },

  async deleteAssignment(id: string): Promise<void> {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Submissions
  async getSubmissions(): Promise<Submission[]> {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(mapSubmission) || [];
  },

  async getSubmissionById(id: string): Promise<Submission | null> {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? mapSubmission(data) : null;
  },

  async createSubmission(submission: Omit<Submission, 'id' | 'submittedAt'>): Promise<Submission> {
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        assignment_id: submission.assignmentId,
        student_id: submission.studentId,
        file_url: submission.fileUrl,
        grade: submission.grade,
        feedback: submission.feedback,
        graded_by: submission.gradedBy,
      })
      .select()
      .single();
    
    if (error) throw error;
    return mapSubmission(data);
  },

  async updateSubmission(id: string, updates: Partial<Submission>): Promise<Submission> {
    const updateData: any = {};
    if (updates.grade !== undefined) updateData.grade = updates.grade;
    if (updates.feedback !== undefined) updateData.feedback = updates.feedback;
    if (updates.gradedBy) updateData.graded_by = updates.gradedBy;
    
    const { data, error } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapSubmission(data);
  },

  async deleteSubmission(id: string): Promise<void> {
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(mapAnnouncement) || [];
  },

  async getAnnouncementById(id: string): Promise<Announcement | null> {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? mapAnnouncement(data) : null;
  },

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        posted_by: announcement.postedBy,
        title: announcement.title,
        body: announcement.body,
        target_group: announcement.targetGroup,
        target_ids: announcement.targetIds || [],
        attachments: announcement.attachments || [],
      })
      .select()
      .single();
    
    if (error) throw error;
    return mapAnnouncement(data);
  },

  async updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement> {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.body) updateData.body = updates.body;
    if (updates.targetGroup) updateData.target_group = updates.targetGroup;
    if (updates.targetIds) updateData.target_ids = updates.targetIds;
    if (updates.attachments) updateData.attachments = updates.attachments;
    
    const { data, error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapAnnouncement(data);
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Messages
  async getMessages(): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data?.map(mapMessage) || [];
  },

  async getMessageById(id: string): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? mapMessage(data) : null;
  },

  async createMessage(message: Omit<Message, 'id'>): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        from_user: message.fromUser,
        to_user: message.toUser,
        group_id: message.groupId,
        group_type: message.groupType,
        body: message.body,
        read: message.read,
        attachments: message.attachments || [],
      })
      .select()
      .single();
    
    if (error) throw error;
    return mapMessage(data);
  },

  async updateMessage(id: string, updates: Partial<Message>): Promise<Message> {
    const updateData: any = {};
    if (updates.read !== undefined) updateData.read = updates.read;
    if (updates.body) updateData.body = updates.body;
    
    const { data, error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapMessage(data);
  },

  async deleteMessage(id: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Timetable
  async getTimetable(): Promise<Timetable[]> {
    const { data, error } = await supabase
      .from('timetable')
      .select('*')
      .order('day', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data?.map(mapTimetable) || [];
  },

  async getTimetableByClass(classId: string): Promise<Timetable[]> {
    const { data, error } = await supabase
      .from('timetable')
      .select('*')
      .eq('class_id', classId)
      .order('day', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data?.map(mapTimetable) || [];
  },

  async createTimetable(timetable: Omit<Timetable, 'id'>): Promise<Timetable> {
    const { data, error } = await supabase
      .from('timetable')
      .insert({
        class_id: timetable.classId,
        subject_id: timetable.subjectId,
        teacher_id: timetable.teacherId,
        day: timetable.day,
        start_time: timetable.startTime,
        end_time: timetable.endTime,
        room: timetable.room,
      })
      .select()
      .single();
    
    if (error) throw error;
    return mapTimetable(data);
  },

  async updateTimetable(id: string, updates: Partial<Timetable>): Promise<Timetable> {
    const updateData: any = {};
    if (updates.classId) updateData.class_id = updates.classId;
    if (updates.subjectId) updateData.subject_id = updates.subjectId;
    if (updates.teacherId) updateData.teacher_id = updates.teacherId;
    if (updates.day) updateData.day = updates.day;
    if (updates.startTime) updateData.start_time = updates.startTime;
    if (updates.endTime) updateData.end_time = updates.endTime;
    if (updates.room !== undefined) updateData.room = updates.room;
    
    const { data, error } = await supabase
      .from('timetable')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapTimetable(data);
  },

  async deleteTimetable(id: string): Promise<void> {
    const { error } = await supabase
      .from('timetable')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

