import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.sqlite');

async function test() {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    const studentData = {
        id: 'TEST' + Date.now(),
        name: 'Test Student',
        email: 'test' + Date.now() + '@example.com',
        course: 'Cosmetology',
        semester: '1st Semester',
        gpa: 0,
        status: 'Active',
        contact: '123',
        photo: '',
        enrolled_date: '2026-02-07',
        dob: '2000-01-01',
        address: 'Test Address',
        guardian_name: 'Guardian',
        guardian_contact: '456',
        blood_group: 'A+'
    };

    try {
        const sql = `INSERT INTO students (
                id, name, email, course, semester, gpa, status, contact, photo, enrolled_date,
                dob, address, guardian_name, guardian_contact, blood_group
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const email = 'duplicate' + Date.now() + '@example.com';

        const params1 = [
            'ID1' + Date.now(), 'Student 1', email, 'Cosmetology',
            '1st Semester', 0, 'Active', '123', '', '2026-02-07',
            null, null, null, null, null
        ];

        const params2 = [
            'ID2' + Date.now(), 'Student 2', email, 'Cosmetology',
            '1st Semester', 0, 'Active', '123', '', '2026-02-07',
            null, null, null, null, null
        ];

        console.log('Inserting first student...');
        await db.run(sql, params1);
        console.log('✅ First success!');

        console.log('Inserting second student with same email...');
        await db.run(sql, params2);
        console.log('✅ Second success (UNEXPECTED)!');
    } catch (error) {
        console.error('❌ Expected Error caught:', error.message);
    } finally {
        await db.close();
    }
}

test();
