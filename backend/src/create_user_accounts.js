import 'dotenv/config';
import { run, query } from './config/database.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function createUserAccounts() {
    try {
        console.log('🔧 Creating user accounts for existing students and faculty...\n');

        // Get all students
        const students = await query('SELECT id, email, name FROM students');
        console.log(`Found ${students.length} students`);

        // Get all faculty
        const faculty = await query('SELECT id, email, name FROM faculty');
        console.log(`Found ${faculty.length} faculty members\n`);

        let createdCount = 0;
        let skippedCount = 0;

        // Create user accounts for students
        console.log('👨‍🎓 Creating student user accounts...');
        for (const student of students) {
            if (!student.email) continue;

            // Check if user already exists
            const existing = await query('SELECT id FROM users WHERE email = ?', [student.email]);
            if (existing.length > 0) {
                skippedCount++;
                continue;
            }

            const randomPassword = crypto.randomBytes(4).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            await run(
                'INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
                [student.email, hashedPassword, 'student', 'Active']
            );
            createdCount++;
            console.log(`  ✅ Created: ${student.email} (password: ${randomPassword})`);
        }

        // Create user accounts for faculty
        console.log('\n👨‍🏫 Creating faculty user accounts...');
        for (const member of faculty) {
            if (!member.email) continue;

            // Check if user already exists
            const existing = await query('SELECT id FROM users WHERE email = ?', [member.email]);
            if (existing.length > 0) {
                skippedCount++;
                continue;
            }

            const randomPassword = crypto.randomBytes(4).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            await run(
                'INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
                [member.email, hashedPassword, 'teacher', 'Active']
            );
            createdCount++;
            console.log(`  ✅ Created: ${member.email} (password: ${randomPassword})`);
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Created: ${createdCount} user accounts`);
        console.log(`   Skipped: ${skippedCount} (already exist)`);

        console.log(`\n✅ Done! All users can now log in with their email and the passwords shown above.`);
        console.log(`   Note: Passwords are randomly generated. Users should change them after first login.`);

    } catch (err) {
        console.error('❌ Error:', err);
    }
    process.exit(0);
}

createUserAccounts();
