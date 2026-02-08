import { getDb } from './src/config/database.js';

async function verifyStudentData() {
    const db = await getDb();
    const studentEmail = 'sarah.johnson@beautex.edu';

    console.log(`🔍 Verifying data for Student: ${studentEmail}...`);

    // 1. Check Student Profile
    const student = await db.get('SELECT * FROM students WHERE email = ?', [studentEmail]);
    if (student) {
        console.log(`✅ Student Profile Found: ${student.name}`);
        console.log(`   - Course: ${student.course}`);
        console.log(`   - GPA: ${student.gpa}`);
    } else {
        console.log('❌ Student Profile NOT Found');
        return;
    }

    // 2. Check Course Details
    const course = await db.get('SELECT * FROM courses WHERE name = ?', [student.course]);
    if (course) {
        console.log(`✅ Enrolled Course Details Found:`);
        console.log(`   - Name: ${course.name}`);
        console.log(`   - Instructor: ${course.instructor}`);
        console.log(`   - Room: ${course.room}`);
    } else {
        console.log(`❌ Course '${student.course}' NOT Found`);
    }

    // 3. Check Announcements (General check)
    const announcements = await db.all('SELECT * FROM announcements ORDER BY date DESC LIMIT 3');
    console.log(`📢 Recent Announcements found: ${announcements.length}`);
}

verifyStudentData()
    .then(() => process.exit(0))
    .catch(console.error);
