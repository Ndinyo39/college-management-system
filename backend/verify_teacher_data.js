import { getDb } from './src/config/database.js';

async function verifyTeacherData() {
    const db = await getDb();
    const teacherEmail = 'james.wilson@beautex.edu';

    console.log(`🔍 Verifying data for ${teacherEmail}...`);

    // 1. Check Faculty Profile
    const faculty = await db.get('SELECT * FROM faculty WHERE email = ?', [teacherEmail]);
    if (faculty) {
        console.log(`✅ Faculty Profile Found: ${faculty.name}`);
    } else {
        console.log('❌ Faculty Profile NOT Found');
        return;
    }

    // 2. Check Courses
    const courses = await db.all('SELECT * FROM courses WHERE instructor = ?', [faculty.name]);
    console.log(`📚 Courses found (${courses.length}):`);
    courses.forEach(c => console.log(`   - ${c.name} (${c.enrolled} students)`));

    // 3. Check Students (enrolled in these courses)
    if (courses.length > 0) {
        const courseNames = courses.map(c => c.name);
        // Need to construct 'IN' clause manually for sqlite
        const placeholders = courseNames.map(() => '?').join(',');
        const students = await db.all(`SELECT * FROM students WHERE course IN (${placeholders})`, courseNames);
        console.log(`🎓 Students found (${students.length}):`);
        students.forEach(s => console.log(`   - ${s.name} (${s.course})`));
    } else {
        console.log('   (No courses, so no students check)');
    }

    // 4. Check Sessions
    const sessions = await db.all('SELECT * FROM sessions WHERE teacher_email = ?', [teacherEmail]);
    console.log(`⏰ Sessions found (${sessions.length}):`);
    sessions.forEach(s => console.log(`   - ${s.day} ${s.time}: ${s.course} (${s.room})`));

}

verifyTeacherData()
    .then(() => process.exit(0))
    .catch(console.error);
