import { query, queryOne, run } from '../config/database.js';

export async function getAllStudents(req, res) {
    try {
        const students = await query('SELECT * FROM students ORDER BY created_at DESC');
        res.json(students);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
}

export async function getStudent(req, res) {
    try {
        const student = await queryOne('SELECT * FROM students WHERE id = ?', [req.params.id]);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({ error: 'Failed to fetch student' });
    }
}

export async function createStudent(req, res) {
    try {
        const {
            id, name, email, course, semester, gpa, status, contact, photo, enrolled_date,
            dob, address, guardian_name, guardian_contact, blood_group, completion_date
        } = req.body;

        if (!id || !name || !email || !course) {
            return res.status(400).json({ error: 'ID, name, email, and course are required' });
        }

        const result = await run(
            `INSERT INTO students (
                id, name, email, course, semester, gpa, status, contact, photo, enrolled_date,
                dob, address, guardian_name, guardian_contact, blood_group, completion_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, name, email, course, semester || '1st Semester', gpa || 0.0, status || 'Active',
                contact, photo, enrolled_date || new Date().toISOString().split('T')[0],
                dob, address, guardian_name, guardian_contact, blood_group, completion_date
            ]
        );

        const newStudent = await queryOne('SELECT * FROM students WHERE id = ?', [id]);
        res.status(201).json(newStudent);
    } catch (error) {
        console.error('Create student error:', error);
        if (error.message.includes('UNIQUE constraint failed: students.id')) {
            return res.status(400).json({ error: 'A student with this Enrollment ID already exists.' });
        }
        if (error.message.includes('UNIQUE constraint failed: students.email')) {
            return res.status(400).json({ error: 'A student with this Academic Email already exists.' });
        }
        res.status(500).json({ error: `Server Error: ${error.message}` });
    }
}

export async function updateStudent(req, res) {
    try {
        const {
            name, email, course, semester, gpa, status, contact, photo,
            dob, address, guardian_name, guardian_contact, blood_group, completion_date
        } = req.body;

        await run(
            `UPDATE students SET
                name = ?, email = ?, course = ?, semester = ?, gpa = ?,
                status = ?, contact = ?, photo = ?, dob = ?, address = ?,
                guardian_name = ?, guardian_contact = ?, blood_group = ?, completion_date = ?,
                updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [
                name, email, course, semester, gpa, status, contact, photo,
                dob, address, guardian_name, guardian_contact, blood_group, completion_date,
                req.params.id
            ]
        );

        const updatedStudent = await queryOne('SELECT * FROM students WHERE id = ?', [req.params.id]);
        res.json(updatedStudent);
    } catch (error) {
        console.error('Update student error:', error);
        if (error.message.includes('UNIQUE constraint failed: students.email')) {
            return res.status(400).json({ error: 'This Academic Email is already assigned to another student.' });
        }
        res.status(500).json({ error: 'Failed to update student profile.' });
    }
}

export async function deleteStudent(req, res) {
    try {
        await run('DELETE FROM students WHERE id = ?', [req.params.id]);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
}

export async function searchStudents(req, res) {
    try {
        const searchQuery = `%${req.query.q}%`;
        const students = await query(
            `SELECT * FROM students 
       WHERE name LIKE ? OR email LIKE ? OR id LIKE ? OR course LIKE ?
       ORDER BY created_at DESC`,
            [searchQuery, searchQuery, searchQuery, searchQuery]
        );
        res.json(students);
    } catch (error) {
        console.error('Search students error:', error);
        res.status(500).json({ error: 'Failed to search students' });
    }
}
