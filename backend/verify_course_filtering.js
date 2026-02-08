import { getDb } from './src/config/database.js';

async function verifyCourseFiltering() {
    const db = await getDb();
    const studentEmail = 'sarah.johnson@beautex.edu';

    console.log(`🔍 Verifying course filtering for Student: ${studentEmail}...`);

    // DEBUG: List all students
    const allStudents = await db.all('SELECT * FROM students');
    console.log('DEBUG: All Students in DB:');
    allStudents.forEach(s => console.log(` - ${s.name} (${s.email})`));

    // 1. Get Student's Enrolled Course
    const student = await db.get('SELECT * FROM students WHERE email = ?', [studentEmail]);
    if (!student) {
        console.log('❌ Student Profile NOT Found');
        return;
    }
    console.log(`✅ Student enrolled in: ${student.course}`);

    // 2. Fetch All Courses (Simulate API call)
    const allCourses = await db.all('SELECT * FROM courses');
    console.log(`📚 Total courses available: ${allCourses.length}`);

    // 3. Simulate Frontend Filtering Logic
    console.log('🔄 Applying filtering logic...');
    const filteredCourses = allCourses.filter(c => c.name === student.course);

    // 4. Verify Result
    if (filteredCourses.length === 1 && filteredCourses[0].name === student.course) {
        console.log(`✅ SUCCESS: Filtered list contains only '${filteredCourses[0].name}'`);
    } else {
        console.log('❌ FAILURE: Filtering logic produced unexpected results.');
        console.log('Filtered List:', filteredCourses.map(c => c.name));
    }
}

verifyCourseFiltering()
    .then(() => process.exit(0))
    .catch(console.error);
