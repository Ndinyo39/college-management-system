import { getDb, initializeDatabase } from '../config/database.js';
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash('admin123', 10);

async function seed() {
    await initializeDatabase();
    const db = await getDb();

    console.log('🌱 Starting database seeding...\n');

    try {
        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await db.run('DELETE FROM attendance');
        await db.run('DELETE FROM grades');
        await db.run('DELETE FROM trainer_reports');
        await db.run('DELETE FROM daily_activity_reports');
        await db.run('DELETE FROM weekly_summary_reports');
        await db.run('DELETE FROM monthly_summary_reports');
        await db.run('DELETE FROM students');
        await db.run('DELETE FROM faculty');
        await db.run('DELETE FROM announcements');
        await db.run('DELETE FROM sessions');
        await db.run('DELETE FROM users WHERE email != "admin@beautex.edu"');

        // Seed Users
        console.log('👥 Seeding users...');
        const users = [
            { email: 'admin@beautex.edu', password: hashedPassword, role: 'admin' },
            { email: 'superadmin@beautex.edu', password: hashedPassword, role: 'superadmin' },
            { email: 'teacher1@beautex.edu', password: hashedPassword, role: 'teacher' },
            { email: 'teacher2@beautex.edu', password: hashedPassword, role: 'teacher' },
            { email: 'student1@beautex.edu', password: hashedPassword, role: 'student' }
        ];

        for (const user of users) {
            await db.run(
                'INSERT OR IGNORE INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
                [user.email, user.password, user.role, 'Active']
            );
        }

        // Seed Students (50 students)
        console.log('🎓 Seeding students...');
        const courses = ['Cosmetology', 'Beauty Therapy', 'Catering', 'Computer Packages', 'Website Development', 'Cyber Security'];
        const firstNames = ['Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Maria', 'John', 'Lisa', 'Robert', 'Jennifer', 'William', 'Linda', 'Richard', 'Patricia', 'Thomas', 'Nancy', 'Charles', 'Karen', 'Daniel', 'Susan', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Dorothy', 'Paul', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna', 'Kenneth', 'Michelle', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy'];
        const lastNames = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez'];
        const statuses = ['Active', 'Active', 'Active', 'Active', 'Active', 'Inactive', 'Graduated'];
        const semesters = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester'];

        const students = [];
        for (let i = 0; i < 50; i++) {
            const firstName = firstNames[i % firstNames.length];
            const lastName = lastNames[i % lastNames.length];
            const course = courses[Math.floor(Math.random() * courses.length)];
            const semester = semesters[Math.floor(Math.random() * semesters.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const gpa = (2.5 + Math.random() * 1.5).toFixed(2);
            const studentId = `BT${2024}${String(i + 1).padStart(3, '0')}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@beautex.edu`;
            const contact = `+254 7${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`;

            // Random enrollment date in the past 2 years
            const enrollDate = new Date(2024 - Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];

            students.push({
                id: studentId,
                name: `${firstName} ${lastName}`,
                email,
                course,
                semester,
                gpa,
                status,
                contact,
                enrolled_date: enrollDate
            });

            await db.run(
                `INSERT INTO students (id, name, email, course, semester, gpa, status, contact, enrolled_date, dob, address) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [studentId, `${firstName} ${lastName}`, email, course, semester, gpa, status, contact, enrollDate,
                    `${Math.floor(Math.random() * 12) + 1990}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
                    `${Math.floor(Math.random() * 1000)} ${['Main St', 'Oak Ave', 'Maple Dr', 'Pine Rd', 'Cedar Ln'][Math.floor(Math.random() * 5)]}, Nairobi`]
            );

            // Create user account for student
            if (status === 'Active') {
                await db.run(
                    'INSERT OR IGNORE INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
                    [email, hashedPassword, 'student', 'Active']
                );
            }
        }

        // Seed Faculty
        console.log('👨‍🏫 Seeding faculty...');
        const faculty = [
            { id: 'FAC001', name: 'Dr. James Wilson', email: 'james.wilson@beautex.edu', department: 'Technology', courses: '["Computer Packages", "Cyber Security"]', contact: '+254 711 111 111', passport: 'A12345678' },
            { id: 'FAC002', name: 'Prof. Sarah Anderson', email: 'sarah.anderson@beautex.edu', department: 'Beauty & Personal Care', courses: '["Cosmetology"]', contact: '+254 711 222 222', passport: 'B23456789' },
            { id: 'FAC003', name: 'Dr. Emily Davis', email: 'emily.davis@beautex.edu', department: 'Beauty & Personal Care', courses: '["Beauty Therapy"]', contact: '+254 711 333 333', passport: 'C34567890' },
            { id: 'FAC004', name: 'Chef Michael Brown', email: 'michael.brown@beautex.edu', department: 'Hospitality', courses: '["Catering"]', contact: '+254 711 444 444', passport: 'D45678901' },
            { id: 'FAC005', name: 'Prof. David Chen', email: 'david.chen@beautex.edu', department: 'Technology', courses: '["Website Development"]', contact: '+254 711 555 555', passport: 'E56789012' },
            { id: 'FAC006', name: 'Dr. Jennifer Park', email: 'jennifer.park@beautex.edu', department: 'Technology', courses: '["Cyber Security"]', contact: '+254 711 666 666', passport: 'F67890123' },
            { id: 'FAC007', name: 'Ms. Grace Ndidi', email: 'grace.ndidi@beautex.edu', department: 'Beauty & Personal Care', courses: '["Cosmetology", "Beauty Therapy"]', contact: '+254 711 777 777', passport: 'G78901234' },
            { id: 'FAC008', name: 'Mr. Peter Kamau', email: 'peter.kamau@beautex.edu', department: 'Hospitality', courses: '["Catering"]', contact: '+254 711 888 888', passport: 'H89012345' }
        ];

        for (const f of faculty) {
            await db.run(
                'INSERT INTO faculty (id, name, email, department, courses, contact, passport, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [f.id, f.name, f.email, f.department, f.courses, f.contact, f.passport, 'Active']
            );

            // Create user account for faculty
            await db.run(
                'INSERT OR IGNORE INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
                [f.email, hashedPassword, 'teacher', 'Active']
            );
        }

        // Seed Attendance (last 90 days)
        console.log('📅 Seeding attendance records...');
        const today = new Date();
        const attendanceStatuses = ['Present', 'Present', 'Present', 'Present', 'Absent', 'Late'];

        for (let daysAgo = 90; daysAgo >= 0; daysAgo--) {
            const date = new Date(today);
            date.setDate(date.getDate() - daysAgo);
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay();

            // Skip weekends
            if (dayOfWeek === 0 || dayOfWeek === 6) continue;

            // Random 70-80% of students attend each day
            const attendingCount = Math.floor(students.length * (0.7 + Math.random() * 0.15));
            const shuffledStudents = [...students].sort(() => Math.random() - 0.5);

            for (let i = 0; i < attendingCount; i++) {
                const student = shuffledStudents[i];
                if (student.status === 'Active') {
                    const status = attendanceStatuses[Math.floor(Math.random() * attendanceStatuses.length)];

                    try {
                        await db.run(
                            'INSERT INTO attendance (student_id, course, date, status) VALUES (?, ?, ?, ?)',
                            [student.id, student.course, dateStr, status]
                        );
                    } catch (err) {
                        // Ignore duplicate errors
                    }
                }
            }
        }

        // Seed Grades
        console.log('📊 Seeding grades...');
        const assignments = ['Quiz 1', 'Quiz 2', 'Midterm Exam', 'Practical Assessment', 'Final Project', 'Assignment 1', 'Assignment 2', 'Lab Work'];

        for (const student of students) {
            if (student.status === 'Active' || student.status === 'Graduated') {
                const numGrades = 3 + Math.floor(Math.random() * 5); // 3-7 grades per student

                for (let i = 0; i < numGrades; i++) {
                    const assignment = assignments[Math.floor(Math.random() * assignments.length)];
                    const maxScore = 100;
                    const score = Math.floor(50 + Math.random() * 50); // 50-100

                    await db.run(
                        'INSERT INTO grades (student_id, course, assignment, score, max_score) VALUES (?, ?, ?, ?, ?)',
                        [student.id, student.course, assignment, score, maxScore]
                    );
                }
            }
        }

        // Seed Announcements
        console.log('📢 Seeding announcements...');
        const announcements = [
            { title: 'Spring Semester Orientation', content: 'All new students must attend the orientation on February 15, 2026 at 9:00 AM in the Main Hall.', author: 'Admin User', category: 'General', priority: 'High', date: '2026-02-05' },
            { title: 'Course Registration Deadline', content: 'Reminder: Course registration for the upcoming semester closes on February 20, 2026. Please ensure all forms are submitted.', author: 'Admin User', category: 'Academic', priority: 'High', date: '2026-02-06' },
            { title: 'Library Hours Extended', content: 'The library will now be open until 10:00 PM on weekdays starting next week to support exam preparation.', author: 'Admin User', category: 'Facilities', priority: 'Medium', date: '2026-02-07' },
            { title: 'Career Fair Next Month', content: 'Mark your calendars! Our annual career fair will be held on March 15, 2026. Many employers will be attending.', author: 'Admin User', category: 'Events', priority: 'Medium', date: '2026-02-01' },
            { title: 'New Equipment Arrived', content: 'The Cosmetology department has received new professional-grade equipment. Training sessions will be held this week.', author: 'Admin User', category: 'Facilities', priority: 'Low', date: '2026-01-28' },
            { title: 'Mid-Semester Exams Schedule', content: 'Mid-semester examinations will take place from February 24-28, 2026. Please check the notice board for your specific exam timetable.', author: 'Admin User', category: 'Academic', priority: 'High', date: '2026-02-08' },
            { title: 'Health and Safety Training', content: 'Mandatory health and safety training for all Catering students this Friday at 2:00 PM.', author: 'Admin User', category: 'General', priority: 'High', date: '2026-02-03' },
            { title: 'Sports Day Announcement', content: 'Annual college sports day scheduled for March 1, 2026. All students are encouraged to participate!', author: 'Admin User', category: 'Events', priority: 'Low', date: '2026-01-25' }
        ];

        for (const announcement of announcements) {
            await db.run(
                'INSERT INTO announcements (title, content, author, category, priority, date) VALUES (?, ?, ?, ?, ?, ?)',
                [announcement.title, announcement.content, announcement.author, announcement.category, announcement.priority, announcement.date]
            );
        }

        // Seed Sessions (Schedule)
        console.log('🗓️  Seeding schedule sessions...');
        const sessions = [
            { day: 'Monday', time: '08:00', course: 'Cosmetology', room: 'Room 101', instructor: 'Prof. Sarah Anderson', teacher_email: 'sarah.anderson@beautex.edu' },
            { day: 'Monday', time: '10:00', course: 'Beauty Therapy', room: 'Lab A', instructor: 'Dr. Emily Davis', teacher_email: 'emily.davis@beautex.edu' },
            { day: 'Monday', time: '14:00', course: 'Website Development', room: 'IT Lab 2', instructor: 'Prof. David Chen', teacher_email: 'david.chen@beautex.edu' },
            { day: 'Tuesday', time: '09:00', course: 'Catering', room: 'Kitchen 1', instructor: 'Chef Michael Brown', teacher_email: 'michael.brown@beautex.edu' },
            { day: 'Tuesday', time: '11:00', course: 'Computer Packages', room: 'IT Lab 1', instructor: 'Dr. James Wilson', teacher_email: 'james.wilson@beautex.edu' },
            { day: 'Tuesday', time: '14:00', course: 'Cyber Security', room: 'IT Lab 3', instructor: 'Dr. Jennifer Park', teacher_email: 'jennifer.park@beautex.edu' },
            { day: 'Wednesday', time: '08:00', course: 'Cosmetology', room: 'Room 101', instructor: 'Ms. Grace Ndidi', teacher_email: 'grace.ndidi@beautex.edu' },
            { day: 'Wednesday', time: '10:00', course: 'Catering', room: 'Kitchen 1', instructor: 'Mr. Peter Kamau', teacher_email: 'peter.kamau@beautex.edu' },
            { day: 'Wednesday', time: '14:00', course: 'Website Development', room: 'IT Lab 2', instructor: 'Prof. David Chen', teacher_email: 'david.chen@beautex.edu' },
            { day: 'Thursday', time: '09:00', course: 'Beauty Therapy', room: 'Lab A', instructor: 'Dr. Emily Davis', teacher_email: 'emily.davis@beautex.edu' },
            { day: 'Thursday', time: '11:00', course: 'Computer Packages', room: 'IT Lab 1', instructor: 'Dr. James Wilson', teacher_email: 'james.wilson@beautex.edu' },
            { day: 'Thursday', time: '14:00', course: 'Cyber Security', room: 'IT Lab 3', instructor: 'Dr. Jennifer Park', teacher_email: 'jennifer.park@beautex.edu' },
            { day: 'Friday', time: '08:00', course: 'Cosmetology', room: 'Room 101', instructor: 'Prof. Sarah Anderson', teacher_email: 'sarah.anderson@beautex.edu' },
            { day: 'Friday', time: '10:00', course: 'Catering', room: 'Kitchen 1', instructor: 'Chef Michael Brown', teacher_email: 'michael.brown@beautex.edu' },
            { day: 'Friday', time: '14:00', course: 'Website Development', room: 'IT Lab 2', instructor: 'Prof. David Chen', teacher_email: 'david.chen@beautex.edu' }
        ];

        for (const session of sessions) {
            await db.run(
                'INSERT INTO sessions (day, time, course, room, instructor, teacher_email) VALUES (?, ?, ?, ?, ?, ?)',
                [session.day, session.time, session.course, session.room, session.instructor, session.teacher_email]
            );
        }

        // Seed Trainer Academic Reports
        console.log('📝 Seeding academic reports...');
        const skillLevels = ['Excellent', 'Good', 'Fair'];
        const recommendations = ['Proceed', 'Proceed', 'Proceed', 'Improve'];

        // Create 20 sample reports
        for (let i = 0; i < 20; i++) {
            const student = students[Math.floor(Math.random() * Math.min(20, students.length))];
            const facultyMember = faculty[Math.floor(Math.random() * faculty.length)];
            const period = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'January 2026', 'February 2026'][Math.floor(Math.random() * 6)];

            await db.run(
                `INSERT INTO trainer_reports (
                    student_id, student_name, registration_number, course_unit, trainer_name, trainer_email,
                    reporting_period, total_lessons, attended_lessons, attendance_percentage,
                    theory_topics, theory_score, theory_remarks, practical_tasks, equipment_used,
                    skill_level, safety_compliance, discipline_issues, trainer_observations,
                    progress_summary, recommendation
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    student.id, student.name, student.id, student.course, facultyMember.name, facultyMember.email,
                    period, 20, 18, 90.0,
                    'Topic 1, Topic 2, Topic 3', 85, 'Good understanding of concepts',
                    'Practical task details', 'Equipment list',
                    skillLevels[Math.floor(Math.random() * skillLevels.length)], 'Yes', 'None',
                    'Student shows good progress', 'Student is performing well in all areas',
                    recommendations[Math.floor(Math.random() * recommendations.length)]
                ]
            );
        }

        // Seed Activity Reports
        console.log('🏫 Seeding activity reports...');

        // Daily Reports (last 10 days)
        for (let daysAgo = 10; daysAgo >= 1; daysAgo--) {
            const date = new Date(today);
            date.setDate(date.getDate() - daysAgo);
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay();

            if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

            await db.run(
                `INSERT INTO daily_activity_reports (
                    report_date, reported_by, classes_conducted, total_attendance_percentage,
                    assessments_conducted, total_students_present, total_students_absent,
                    late_arrivals, new_enrollments, staff_present, staff_absent, facilities_issues,
                    equipment_maintenance, notable_events, incidents, achievements, additional_notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    dateStr, 'Admin User', 12 + Math.floor(Math.random() * 3),
                    85 + Math.random() * 10, Math.floor(Math.random() * 3),
                    40 + Math.floor(Math.random() * 8), 5 + Math.floor(Math.random() * 5),
                    Math.floor(Math.random() * 3), Math.floor(Math.random() * 4),
                    8, 0, '[]', '', 'Regular classes conducted smoothly',
                    '', 'Students performed well in practical sessions',
                    'All departments operating normally'
                ]
            );
        }

        // Weekly Reports (last 3 weeks)
        for (let weeksAgo = 3; weeksAgo >= 1; weeksAgo--) {
            const startDate = new Date(today);
            startDate.setDate(startDate.getDate() - (weeksAgo * 7));
            startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Monday

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 4); // Friday

            await db.run(
                `INSERT INTO weekly_summary_reports (
                    week_start_date, week_end_date, reported_by, total_classes_conducted,
                    average_attendance, total_assessments, active_students,
                    avg_student_attendance, disciplinary_cases, courses_completed,
                    new_enrollments, key_achievements, challenges_faced, action_items,
                    revenue_collected, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    startDate.toISOString().split('T')[0],
                    endDate.toISOString().split('T')[0],
                    'Admin User', 60, 87.5, 8, 45, 87.5, 2, 0, 2,
                    'Successful completion of practical assessments in Cosmetology department',
                    'Some equipment in catering lab needs maintenance',
                    'Schedule equipment servicing, Review attendance policies',
                    0, 'Productive week overall with good student engagement'
                ]
            );
        }

        // Monthly Report (January 2026)
        await db.run(
            `INSERT INTO monthly_summary_reports (
                month, month_start_date, month_end_date, reported_by, total_students,
                new_enrollments, graduations, dropouts, total_classes, average_attendance,
                total_assessments, average_pass_rate, total_faculty, new_hires,
                faculty_departures, revenue, expenses, major_achievements, challenges,
                strategic_initiatives, goals_next_month, additional_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                'January 2026', '2026-01-01', '2026-01-31', 'Admin User', 48, 5, 0, 2,
                240, 86.5, 32, 78.5, 8, 0, 0, 0, 0,
                'Successfully launched new Website Development program. High student satisfaction in end-of-month surveys.',
                'Need to expand computer lab capacity. Some delays in equipment procurement.',
                'Planning career fair for March. Developing partnerships with local beauty salons for internships.',
                'Increase average attendance to 90%. Complete lab expansion. Finalize career fair preparations.',
                'Strong start to the year with good enrollment numbers and student engagement.'
            ]
        );

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        const counts = {
            students: await db.get('SELECT COUNT(*) as count FROM students'),
            faculty: await db.get('SELECT COUNT(*) as count FROM faculty'),
            attendance: await db.get('SELECT COUNT(*) as count FROM attendance'),
            grades: await db.get('SELECT COUNT(*) as count FROM grades'),
            announcements: await db.get('SELECT COUNT(*) as count FROM announcements'),
            sessions: await db.get('SELECT COUNT(*) as count FROM sessions'),
            trainer_reports: await db.get('SELECT COUNT(*) as count FROM trainer_reports'),
            daily_reports: await db.get('SELECT COUNT(*) as count FROM daily_activity_reports'),
            weekly_reports: await db.get('SELECT COUNT(*) as count FROM weekly_summary_reports'),
            monthly_reports: await db.get('SELECT COUNT(*) as count FROM monthly_summary_reports')
        };

        console.log(`   Students: ${counts.students.count}`);
        console.log(`   Faculty: ${counts.faculty.count}`);
        console.log(`   Attendance Records: ${counts.attendance.count}`);
        console.log(`   Grade Entries: ${counts.grades.count}`);
        console.log(`   Announcements: ${counts.announcements.count}`);
        console.log(`   Schedule Sessions: ${counts.sessions.count}`);
        console.log(`   Academic Reports: ${counts.trainer_reports.count}`);
        console.log(`   Daily Activity Reports: ${counts.daily_reports.count}`);
        console.log(`   Weekly Summary Reports: ${counts.weekly_reports.count}`);
        console.log(`   Monthly Summary Reports: ${counts.monthly_reports.count}`);
        console.log('\n🎉 Ready to use! Login credentials: admin@beautex.edu / admin123\n');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

seed()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
