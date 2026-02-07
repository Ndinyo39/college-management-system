-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  course TEXT NOT NULL,
  semester TEXT,
  gpa REAL DEFAULT 0.0,
  status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'Graduated')),
  contact TEXT,
  photo TEXT,
  dob DATE,
  address TEXT,
  guardian_name TEXT,
  guardian_contact TEXT,
  blood_group TEXT,
  enrolled_date DATE DEFAULT (date('now')),
  completion_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  courses TEXT, -- JSON array of course names
  contact TEXT,
  status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  course TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Late')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(student_id, course, date)
);

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  course TEXT NOT NULL,
  assignment TEXT NOT NULL,
  score REAL NOT NULL,
  max_score REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('General', 'Academic', 'Facilities', 'Events')),
  priority TEXT NOT NULL CHECK(priority IN ('High', 'Medium', 'Low')),
  date DATE DEFAULT (date('now')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo admin user (password: admin123)
INSERT OR IGNORE INTO users (email, password, role) VALUES 
('admin@beautex.edu', '$2a$10$LCvyJlH2SBv8/ew3PgxNT.6GUjlBsQklZNyqwfeO7jFzOlMm5Wb.O', 'admin');

-- Insert demo courses
INSERT OR IGNORE INTO courses (id, name, department, instructor, duration, enrolled, capacity, schedule, room, status) VALUES
('COS101', 'Cosmetology', 'Beauty & Personal Care', 'Prof. Sarah Anderson', '12 weeks', 32, 40, 'Mon, Wed, Fri 9:00-11:00 AM', 'Room 101', 'Active'),
('BT101', 'Beauty Therapy', 'Beauty & Personal Care', 'Dr. Emily Davis', '10 weeks', 28, 35, 'Tue, Thu 2:00-4:00 PM', 'Room 102', 'Active'),
('CAT101', 'Catering', 'Hospitality', 'Chef Michael Brown', '14 weeks', 25, 30, 'Mon, Wed 1:00-3:00 PM', 'Kitchen Lab', 'Active'),
('CP101', 'Computer Packages', 'Technology', 'Dr. James Wilson', '8 weeks', 35, 40, 'Tue, Thu 10:00-12:00 PM', 'Computer Lab 1', 'Active'),
('WD101', 'Website Development', 'Technology', 'Prof. David Chen', '12 weeks', 30, 35, 'Mon, Wed, Fri 2:00-4:00 PM', 'Computer Lab 2', 'Active'),
('CS101', 'Cyber Security', 'Technology', 'Dr. Jennifer Park', '10 weeks', 22, 25, 'Tue, Thu 9:00-11:00 AM', 'Computer Lab 3', 'Active');

-- Insert demo students
INSERT OR IGNORE INTO students (id, name, email, course, semester, gpa, status, contact, enrolled_date) VALUES
('BT2024001', 'Sarah Johnson', 'sarah.johnson@beautex.edu', 'Cosmetology', '4th Semester', 3.8, 'Active', '+254 700 123 456', '2023-09-15'),
('BT2024002', 'Michael Chen', 'michael.chen@beautex.edu', 'Beauty Therapy', '3rd Semester', 3.6, 'Active', '+254 700 234 567', '2024-01-10'),
('BT2024003', 'Emily Rodriguez', 'emily.rodriguez@beautex.edu', 'Catering', '6th Semester', 3.9, 'Active', '+254 700 345 678', '2022-09-01'),
('BT2024004', 'David Kim', 'david.kim@beautex.edu', 'Computer Packages', '2nd Semester', 3.5, 'Active', '+254 700 456 789', '2024-05-20'),
('BT2024005', 'Jessica Taylor', 'jessica.taylor@beautex.edu', 'Website Development', '5th Semester', 3.7, 'Active', '+254 700 567 890', '2023-01-15');

-- Insert demo faculty
INSERT OR IGNORE INTO faculty (id, name, email, department, courses, contact, status) VALUES
('FAC001', 'Dr. James Wilson', 'james.wilson@beautex.edu', 'Technology', '["Computer Packages"]', '+254 711 111 111', 'Active'),
('FAC002', 'Prof. Sarah Anderson', 'sarah.anderson@beautex.edu', 'Beauty & Personal Care', '["Cosmetology"]', '+254 711 222 222', 'Active'),
('FAC003', 'Dr. Emily Davis', 'emily.davis@beautex.edu', 'Beauty & Personal Care', '["Beauty Therapy"]', '+254 711 333 333', 'Active'),
('FAC004', 'Chef Michael Brown', 'michael.brown@beautex.edu', 'Hospitality', '["Catering"]', '+254 711 444 444', 'Active'),
('FAC005', 'Prof. David Chen', 'david.chen@beautex.edu', 'Technology', '["Website Development"]', '+254 711 555 555', 'Active'),
('FAC006', 'Dr. Jennifer Park', 'jennifer.park@beautex.edu', 'Technology', '["Cyber Security"]', '+254 711 666 666', 'Active');

-- Insert demo announcements
INSERT OR IGNORE INTO announcements (title, content, author, category, priority, date) VALUES
('Spring Semester Orientation', 'All new students must attend the orientation on February 15, 2026 at 9:00 AM.', 'Admin User', 'General', 'High', '2026-02-05'),
('Course Registration Deadline', 'Reminder: Course registration for the upcoming semester closes on February 20, 2026.', 'Admin User', 'Academic', 'Medium', '2026-02-06'),
('Library Hours Extended', 'The library will now be open until 10:00 PM on weekdays starting next week.', 'Admin User', 'Facilities', 'Low', '2026-02-07');
