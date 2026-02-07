import bcrypt from 'bcryptjs';
import { run, queryOne } from './src/config/database.js';

async function seedUsers() {
    try {
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Demo Student
        const studentEmail = 'sarah.johnson@beautex.edu';
        const existingStudent = await queryOne('SELECT * FROM users WHERE email = ?', [studentEmail]);
        if (!existingStudent) {
            await run(
                'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
                [studentEmail, hashedPassword, 'student']
            );
            console.log('✅ Demo student user created');
        } else {
            console.log('ℹ️ Demo student user already exists');
        }

        // Demo Teacher
        const teacherEmail = 'james.wilson@beautex.edu';
        const existingTeacher = await queryOne('SELECT * FROM users WHERE email = ?', [teacherEmail]);
        if (!existingTeacher) {
            await run(
                'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
                [teacherEmail, hashedPassword, 'teacher']
            );
            console.log('✅ Demo teacher user created');
        } else {
            console.log('ℹ️ Demo teacher user already exists');
        }

    } catch (error) {
        console.error('❌ Seeding error:', error);
    }
}

seedUsers();
