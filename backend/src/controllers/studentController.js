import { getDb } from '../config/database.js';

// Helper to check if using MongoDB
async function isMongo() {
    const db = await getDb();
    return db.constructor.name === 'NativeConnection';
}

export async function getAllStudents(req, res) {
    try {
        if (await isMongo()) {
            const Student = (await import('../models/mongo/Student.js')).default;
            const students = await Student.find().sort({ created_at: -1 });
            return res.json(students);
        }

        const db = await getDb();
        const students = await db.all('SELECT * FROM students ORDER BY created_at DESC');
        res.json(students);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
}

export async function getStudent(req, res) {
    try {
        if (await isMongo()) {
            const Student = (await import('../models/mongo/Student.js')).default;
            const student = await Student.findOne({ id: req.params.id });
            if (!student) return res.status(404).json({ error: 'Student not found' });
            return res.json(student);
        }

        const db = await getDb();
        const student = await db.get('SELECT * FROM students WHERE id = ?', [req.params.id]);
        if (!student) return res.status(404).json({ error: 'Student not found' });
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

        if (await isMongo()) {
            const Student = (await import('../models/mongo/Student.js')).default;
            const newStudent = new Student({
                id, name, email, course,
                semester: semester || '1st Semester',
                gpa: gpa || 0.0,
                status: status || 'Active',
                contact, photo,
                enrolled_date: enrolled_date || new Date(),
                dob, address, guardian_name, guardian_contact, blood_group, completion_date
            });
            const savedStudent = await newStudent.save();
            return res.status(201).json(savedStudent);
        }

        const db = await getDb();
        await db.run(
            `INSERT INTO students (id, name, email, course, semester, gpa, status, contact, photo, enrolled_date, dob, address, guardian_name, guardian_contact, blood_group, completion_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, email, course, semester || '1st Semester', gpa || 0.0, status || 'Active', contact, photo, enrolled_date, dob, address, guardian_name, guardian_contact, blood_group, completion_date]
        );
        const student = await db.get('SELECT * FROM students WHERE id = ?', [id]);
        res.status(201).json(student);
    } catch (error) {
        console.error('Create student error:', error);
        if (error.code === 'SQLITE_CONSTRAINT' || error.code === 11000) {
            return res.status(400).json({ error: 'A student with this ID or email already exists.' });
        }
        res.status(500).json({ error: `Server Error: ${error.message}` });
    }
}

export async function updateStudent(req, res) {
    try {
        if (await isMongo()) {
            const Student = (await import('../models/mongo/Student.js')).default;
            const updatedStudent = await Student.findOneAndUpdate(
                { id: req.params.id },
                { $set: { ...req.body, updated_at: new Date() } },
                { new: true, runValidators: true }
            );
            if (!updatedStudent) return res.status(404).json({ error: 'Student not found' });
            return res.json(updatedStudent);
        }

        const db = await getDb();
        const fields = Object.keys(req.body).filter(k => k !== 'id');
        if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => req.body[f]);
        values.push(req.params.id);

        await db.run(`UPDATE students SET ${setClause}, updated_at = datetime('now') WHERE id = ?`, values);
        const student = await db.get('SELECT * FROM students WHERE id = ?', [req.params.id]);
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json(student);
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ error: 'Failed to update student profile.' });
    }
}

export async function deleteStudent(req, res) {
    try {
        if (await isMongo()) {
            const Student = (await import('../models/mongo/Student.js')).default;
            const result = await Student.findOneAndDelete({ id: req.params.id });
            if (!result) return res.status(404).json({ error: 'Student not found' });
            return res.json({ message: 'Student deleted successfully' });
        }

        const db = await getDb();
        const result = await db.run('DELETE FROM students WHERE id = ?', [req.params.id]);
        if (result.changes === 0) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
}

export async function searchStudents(req, res) {
    try {
        const query = req.query.q;

        if (await isMongo()) {
            const Student = (await import('../models/mongo/Student.js')).default;
            const regex = new RegExp(query, 'i');
            const students = await Student.find({
                $or: [{ name: regex }, { email: regex }, { id: regex }, { course: regex }]
            }).sort({ created_at: -1 });
            return res.json(students);
        }

        const db = await getDb();
        const students = await db.all(
            `SELECT * FROM students WHERE name LIKE ? OR email LIKE ? OR id LIKE ? OR course LIKE ? ORDER BY created_at DESC`,
            [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
        );
        res.json(students);
    } catch (error) {
        console.error('Search students error:', error);
        res.status(500).json({ error: 'Failed to search students' });
    }
}
