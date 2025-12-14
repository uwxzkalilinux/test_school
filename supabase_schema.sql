-- ============================================
-- School Management System - Supabase Schema
-- ============================================
-- This SQL script creates all tables and default data
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
  parent_of TEXT[], -- Array of student IDs if role is parent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CLASSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  level VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. SUBJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  teacher_id UUID, -- Will be linked via teacher_subjects junction table
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. TEACHERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. STUDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  student_id VARCHAR(100) UNIQUE NOT NULL, -- Student ID number
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. JUNCTION TABLES (Many-to-Many)
-- ============================================

-- Teacher-Subject relationship (many-to-many)
CREATE TABLE IF NOT EXISTS teacher_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(teacher_id, subject_id)
);

-- Subject-Class relationship (many-to-many)
CREATE TABLE IF NOT EXISTS subject_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  UNIQUE(subject_id, class_id)
);

-- ============================================
-- 7. ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, subject_id, date)
);

-- ============================================
-- 8. GRADES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  exam_type VARCHAR(50) NOT NULL, -- 'exam', 'quiz', 'homework', 'activity'
  score DECIMAL(10,2) NOT NULL,
  max_score DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  attachments TEXT[], -- Array of file URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  grade DECIMAL(10,2),
  feedback TEXT,
  graded_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  UNIQUE(assignment_id, student_id)
);

-- ============================================
-- 11. ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  posted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  target_group VARCHAR(20) NOT NULL CHECK (target_group IN ('all', 'class', 'subject', 'role')),
  target_ids TEXT[], -- Array of Class IDs, Subject IDs, or Role names
  attachments TEXT[], -- Array of file URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 12. MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user UUID REFERENCES users(id) ON DELETE CASCADE, -- For direct messages
  group_id UUID, -- For group messages (class or subject)
  group_type VARCHAR(20) CHECK (group_type IN ('class', 'subject')),
  body TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  attachments TEXT[] -- Array of file URLs
);

-- ============================================
-- 13. TIMETABLE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS timetable (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  day VARCHAR(20) NOT NULL CHECK (day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_messages_from_user ON messages(from_user);
CREATE INDEX IF NOT EXISTS idx_messages_to_user ON messages(to_user);
CREATE INDEX IF NOT EXISTS idx_timetable_class_id ON timetable(class_id);
CREATE INDEX IF NOT EXISTS idx_timetable_day ON timetable(day);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DEFAULT DATA (Insert with hashed passwords)
-- ============================================
-- Note: Passwords are hashed using bcrypt with salt rounds 10
-- Default passwords:
--   admin: admin123
--   teachers: teacher123
--   students: student123
--   parent: parent123

-- Insert Admin User
INSERT INTO users (id, name, email, password, role, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Admin User', 'admin@school.com', '$2a$10$r8qQ5rXvK5qJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'admin', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert Default Classes
INSERT INTO classes (id, name, level, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'الصف العاشر - أ', '10', NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'الصف العاشر - ب', '10', NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'الصف الحادي عشر - أ', '11', NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'الصف الثاني عشر - أ', '12', NOW())
ON CONFLICT DO NOTHING;

-- Insert Default Subjects
INSERT INTO subjects (id, name, code, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 'الرياضيات', 'MATH', NOW()),
  ('550e8400-e29b-41d4-a716-446655440011', 'الفيزياء', 'PHY', NOW()),
  ('550e8400-e29b-41d4-a716-446655440012', 'الكيمياء', 'CHEM', NOW()),
  ('550e8400-e29b-41d4-a716-446655440013', 'اللغة العربية', 'ARAB', NOW()),
  ('550e8400-e29b-41d4-a716-446655440014', 'اللغة الإنجليزية', 'ENG', NOW()),
  ('550e8400-e29b-41d4-a716-446655440015', 'التاريخ', 'HIST', NOW()),
  ('550e8400-e29b-41d4-a716-446655440016', 'الجغرافيا', 'GEO', NOW())
ON CONFLICT DO NOTHING;

-- Insert Teacher Users
-- Password: teacher123
INSERT INTO users (id, name, email, password, role, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440020', 'أستاذ أحمد محمد', 'teacher1@school.com', '$2a$10$bEZfpfA/RieH1SbNEntvYefdIuDtFxm3FW.doAH8wrU7FClpw053i', 'teacher', NOW()),
  ('550e8400-e29b-41d4-a716-446655440021', 'أستاذة فاطمة علي', 'teacher2@school.com', '$2a$10$bEZfpfA/RieH1SbNEntvYefdIuDtFxm3FW.doAH8wrU7FClpw053i', 'teacher', NOW()),
  ('550e8400-e29b-41d4-a716-446655440022', 'أستاذ خالد حسن', 'teacher3@school.com', '$2a$10$bEZfpfA/RieH1SbNEntvYefdIuDtFxm3FW.doAH8wrU7FClpw053i', 'teacher', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert Teacher Records
INSERT INTO teachers (id, user_id, name, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440020', 'أستاذ أحمد محمد', NOW()),
  ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', 'أستاذة فاطمة علي', NOW()),
  ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440022', 'أستاذ خالد حسن', NOW())
ON CONFLICT DO NOTHING;

-- Link Teachers to Subjects
INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440010'), -- Teacher 1 -> Math
  ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440011'), -- Teacher 1 -> Physics
  ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440013'), -- Teacher 2 -> Arabic
  ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440014'), -- Teacher 2 -> English
  ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440012'), -- Teacher 3 -> Chemistry
  ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440015')  -- Teacher 3 -> History
ON CONFLICT DO NOTHING;

-- Link Subjects to Classes
INSERT INTO subject_classes (subject_id, class_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001'), -- Math -> Class 1
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002'), -- Math -> Class 2
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001'), -- Physics -> Class 1
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002'), -- Physics -> Class 2
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001'), -- Chemistry -> Class 1
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002'), -- Chemistry -> Class 2
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001'), -- Arabic -> Class 1
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002'), -- Arabic -> Class 2
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003'), -- Arabic -> Class 3
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001'), -- English -> Class 1
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002'), -- English -> Class 2
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440003'), -- English -> Class 3
  ('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003'), -- History -> Class 3
  ('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440004'), -- History -> Class 4
  ('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440003'), -- Geography -> Class 3
  ('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440004')  -- Geography -> Class 4
ON CONFLICT DO NOTHING;

-- Insert Student Users
-- Password: student123
INSERT INTO users (id, name, email, password, role, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440040', 'محمد علي', 'student1@school.com', '$2a$10$z2ETxcc7IF7MfophOBRP3OCL.t.n6ztGe2TWsHUqzcR4LZUTniFki', 'student', NOW()),
  ('550e8400-e29b-41d4-a716-446655440041', 'سارة أحمد', 'student2@school.com', '$2a$10$z2ETxcc7IF7MfophOBRP3OCL.t.n6ztGe2TWsHUqzcR4LZUTniFki', 'student', NOW()),
  ('550e8400-e29b-41d4-a716-446655440042', 'علي حسن', 'student3@school.com', '$2a$10$z2ETxcc7IF7MfophOBRP3OCL.t.n6ztGe2TWsHUqzcR4LZUTniFki', 'student', NOW()),
  ('550e8400-e29b-41d4-a716-446655440043', 'فاطمة خالد', 'student4@school.com', '$2a$10$z2ETxcc7IF7MfophOBRP3OCL.t.n6ztGe2TWsHUqzcR4LZUTniFki', 'student', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert Student Records
INSERT INTO students (id, user_id, name, class_id, student_id, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440040', 'محمد علي', '550e8400-e29b-41d4-a716-446655440001', 'STU-001', NOW()),
  ('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440041', 'سارة أحمد', '550e8400-e29b-41d4-a716-446655440001', 'STU-002', NOW()),
  ('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440042', 'علي حسن', '550e8400-e29b-41d4-a716-446655440002', 'STU-003', NOW()),
  ('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440043', 'فاطمة خالد', '550e8400-e29b-41d4-a716-446655440002', 'STU-004', NOW())
ON CONFLICT DO NOTHING;

-- Insert Parent User
-- Password: parent123
INSERT INTO users (id, name, email, password, role, parent_of, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440060', 'والد محمد علي', 'parent1@school.com', '$2a$10$BfViEKa0gCFv0B.ALSiueeTDhg339af0QrREyMkifTNMFI8SoOjLK', 'parent', ARRAY['550e8400-e29b-41d4-a716-446655440050'], NOW())
ON CONFLICT (email) DO NOTHING;

-- Update student to link to parent
UPDATE students SET parent_id = '550e8400-e29b-41d4-a716-446655440060' WHERE id = '550e8400-e29b-41d4-a716-446655440050';

