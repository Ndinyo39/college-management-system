-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('superadmin', 'admin', 'teacher', 'student')),
  status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  course TEXT NOT NULL,
  semester TEXT,
  gpa DECIMAL DEFAULT 0.0,
  status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'Graduated')),
  contact TEXT,
  photo TEXT,
  dob DATE,
  address TEXT,
  guardian_name TEXT,
  guardian_contact TEXT,
  blood_group TEXT,
  enrolled_date DATE DEFAULT CURRENT_DATE,
  completion_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  instructor TEXT NOT NULL,
  duration TEXT,
  enrolled INTEGER DEFAULT 0,
  capacity INTEGER NOT NULL,
  schedule TEXT,
  room TEXT,
  status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  courses TEXT, -- JSON string of course names
  contact TEXT,
  passport TEXT,
  status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Late')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course, date)
);

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
  id SERIAL PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course TEXT NOT NULL,
  assignment TEXT NOT NULL,
  score DECIMAL NOT NULL,
  max_score DECIMAL NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('General', 'Academic', 'Facilities', 'Events')),
  priority TEXT NOT NULL CHECK(priority IN ('High', 'Medium', 'Low')),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions (Schedule) table
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  course TEXT NOT NULL,
  room TEXT NOT NULL,
  instructor TEXT NOT NULL,
  teacher_email TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trainer Academic Reports table
CREATE TABLE IF NOT EXISTS trainer_reports (
  id SERIAL PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  course_unit TEXT NOT NULL,
  trainer_name TEXT NOT NULL,
  trainer_email TEXT NOT NULL,
  reporting_period TEXT NOT NULL,
  total_lessons INTEGER DEFAULT 0,
  attended_lessons INTEGER DEFAULT 0,
  attendance_percentage DECIMAL DEFAULT 0.0,
  theory_topics TEXT,
  theory_score DECIMAL,
  theory_remarks TEXT,
  practical_tasks TEXT,
  equipment_used TEXT,
  skill_level TEXT CHECK(skill_level IN ('Excellent', 'Good', 'Fair', 'Poor')),
  safety_compliance TEXT CHECK(safety_compliance IN ('Yes', 'No')),
  discipline_issues TEXT,
  trainer_observations TEXT,
  progress_summary TEXT,
  recommendation TEXT CHECK(recommendation IN ('Proceed', 'Improve', 'Review')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Activity Reports
CREATE TABLE IF NOT EXISTS daily_activity_reports (
  id SERIAL PRIMARY KEY,
  report_date DATE NOT NULL UNIQUE,
  reported_by TEXT NOT NULL,
  classes_conducted INTEGER DEFAULT 0,
  total_attendance_percentage DECIMAL DEFAULT 0.0,
  assessments_conducted INTEGER DEFAULT 0,
  total_students_present INTEGER DEFAULT 0,
  total_students_absent INTEGER DEFAULT 0,
  late_arrivals INTEGER DEFAULT 0,
  new_enrollments INTEGER DEFAULT 0,
  staff_present INTEGER DEFAULT 0,
  staff_absent INTEGER DEFAULT 0,
  facilities_issues TEXT,
  equipment_maintenance TEXT,
  notable_events TEXT,
  incidents TEXT,
  achievements TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weekly Summary Reports
CREATE TABLE IF NOT EXISTS weekly_summary_reports (
  id SERIAL PRIMARY KEY,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  reported_by TEXT NOT NULL,
  total_classes_conducted INTEGER DEFAULT 0,
  average_attendance DECIMAL DEFAULT 0.0,
  total_assessments INTEGER DEFAULT 0,
  active_students INTEGER DEFAULT 0,
  avg_student_attendance DECIMAL DEFAULT 0.0,
  disciplinary_cases INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  new_enrollments INTEGER DEFAULT 0,
  key_achievements TEXT,
  challenges_faced TEXT,
  action_items TEXT,
  revenue_collected DECIMAL DEFAULT 0.0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(week_start_date, week_end_date)
);

-- Monthly Summary Reports
CREATE TABLE IF NOT EXISTS monthly_summary_reports (
  id SERIAL PRIMARY KEY,
  month TEXT NOT NULL,
  month_start_date DATE NOT NULL,
  month_end_date DATE NOT NULL,
  reported_by TEXT NOT NULL,
  total_students INTEGER DEFAULT 0,
  new_enrollments INTEGER DEFAULT 0,
  graduations INTEGER DEFAULT 0,
  dropouts INTEGER DEFAULT 0,
  total_classes INTEGER DEFAULT 0,
  average_attendance DECIMAL DEFAULT 0.0,
  total_assessments INTEGER DEFAULT 0,
  average_pass_rate DECIMAL DEFAULT 0.0,
  total_faculty INTEGER DEFAULT 0,
  new_hires INTEGER DEFAULT 0,
  faculty_departures INTEGER DEFAULT 0,
  revenue DECIMAL DEFAULT 0.0,
  expenses DECIMAL DEFAULT 0.0,
  major_achievements TEXT,
  challenges TEXT,
  strategic_initiatives TEXT,
  goals_next_month TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(month_start_date, month_end_date)
);

-- Initial Demo Data (ON CONFLICT DO NOTHING for PostgreSQL)
INSERT INTO users (email, password, role) VALUES 
('admin@beautex.edu', '$2a$10$LCvyJlH2SBv8/ew3PgxNT.6GUjlBsQklZNyqwfeO7jFzOlMm5Wb.O', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO courses (id, name, department, instructor, duration, enrolled, capacity, schedule, room, status) VALUES
('COS101', 'Cosmetology', 'Beauty & Personal Care', 'Prof. Sarah Anderson', '12 weeks', 32, 40, 'Mon, Wed, Fri 9:00-11:00 AM', 'Room 101', 'Active'),
('BT101', 'Beauty Therapy', 'Beauty & Personal Care', 'Dr. Emily Davis', '10 weeks', 28, 35, 'Tue, Thu 2:00-4:00 PM', 'Room 102', 'Active'),
('CAT101', 'Catering', 'Hospitality', 'Chef Michael Brown', '14 weeks', 25, 30, 'Mon, Wed 1:00-3:00 PM', 'Kitchen Lab', 'Active'),
('CP101', 'Computer Packages', 'Technology', 'Dr. James Wilson', '8 weeks', 35, 40, 'Tue, Thu 10:00-12:00 PM', 'Computer Lab 1', 'Active'),
('WD101', 'Website Development', 'Technology', 'Prof. David Chen', '12 weeks', 30, 35, 'Mon, Wed, Fri 2:00-4:00 PM', 'Computer Lab 2', 'Active'),
('CS101', 'Cyber Security', 'Technology', 'Dr. Jennifer Park', '10 weeks', 22, 25, 'Tue, Thu 9:00-11:00 AM', 'Computer Lab 3', 'Active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO students (id, name, email, course, semester, gpa, status, contact, enrolled_date) VALUES
('BT2024001', 'Sarah Johnson', 'sarah.johnson@beautex.edu', 'Cosmetology', '4th Semester', 3.8, 'Active', '+254 700 123 456', '2023-09-15'),
('BT2024002', 'Michael Chen', 'michael.chen@beautex.edu', 'Beauty Therapy', '3rd Semester', 3.6, 'Active', '+254 700 234 567', '2024-01-10'),
('BT2024003', 'Emily Rodriguez', 'emily.rodriguez@beautex.edu', 'Catering', '6th Semester', 3.9, 'Active', '+254 700 345 678', '2022-09-01'),
('BT2024004', 'David Kim', 'david.kim@beautex.edu', 'Computer Packages', '2nd Semester', 3.5, 'Active', '+254 700 456 789', '2024-05-20'),
('BT2024005', 'Jessica Taylor', 'jessica.taylor@beautex.edu', 'Website Development', '5th Semester', 3.7, 'Active', '+254 700 567 890', '2023-01-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO faculty (id, name, email, department, courses, contact, status) VALUES
('FAC001', 'Dr. James Wilson', 'james.wilson@beautex.edu', 'Technology', '["Computer Packages"]', '+254 711 111 111', 'Active'),
('FAC002', 'Prof. Sarah Anderson', 'sarah.anderson@beautex.edu', 'Beauty & Personal Care', '["Cosmetology"]', '+254 711 222 222', 'Active'),
('FAC003', 'Dr. Emily Davis', 'emily.davis@beautex.edu', 'Beauty & Personal Care', '["Beauty Therapy"]', '+254 711 333 333', 'Active'),
('FAC004', 'Chef Michael Brown', 'michael.brown@beautex.edu', 'Hospitality', '["Catering"]', '+254 711 444 444', 'Active'),
('FAC005', 'Prof. David Chen', 'david.chen@beautex.edu', 'Technology', '["Website Development"]', '+254 711 555 555', 'Active'),
('FAC006', 'Dr. Jennifer Park', 'jennifer.park@beautex.edu', 'Technology', '["Cyber Security"]', '+254 711 666 666', 'Active')
ON CONFLICT (id) DO NOTHING;
