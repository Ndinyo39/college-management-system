import { getDb, query, queryOne, run } from '../config/database.js';
import { createUser } from './authController.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

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

        const students = await query('SELECT * FROM students ORDER BY created_at DESC');
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

        const student = await queryOne('SELECT * FROM students WHERE id = ?', [req.params.id]);
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json(student);
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({ error: 'Failed to fetch student' });
    }
}

export async function createStudent(req, res) {
    try {
        const { id, name, email, course, intake, contact, photo, dob, address, guardian_name, guardian_contact, blood_group } = req.body;

        if (!id || !name || !email || !course) {
            return res.status(400).json({ error: 'ID, name, email, and course are required' });
        }

        if (await isMongo()) {
            const Student = (await import('../models/mongo/Student.js')).default;
            const newStudent = new Student({
                id, name, email, course,
                intake: intake || '1st Intake', // Changed from semester
                gpa: req.body.gpa || 0.0, // Retained gpa from original
                status: req.body.status || 'Active', // Retained status from original
                contact, photo,
                enrolled_date: req.body.enrolled_date || new Date(), // Retained enrolled_date from original
                dob, address, guardian_name, guardian_contact, blood_group,
                completion_date: req.body.completion_date // Retained completion_date from original
            });
            const savedStudent = await newStudent.save();

            // Create User Account for the student
            try {
                const User = (await import('../models/mongo/User.js')).default;
                const existingUser = await User.findOne({ email });
                if (!existingUser) {
                    const randomPassword = crypto.randomBytes(4).toString('hex');
                    const hashedPassword = await bcrypt.hash(randomPassword, 10);

                    const newUser = new User({
                        email,
                        password: hashedPassword,
                        role: 'student',
                        must_change_password: true
                    });
                    await newUser.save();

                    await sendWelcomeEmail(email, 'student', randomPassword);
                    console.log(`✅ User account created and invitation email sent for student: ${email}`);
                }
            } catch (userError) {
                console.error('Failed to create user account for student (Mongo):', userError);
            }

            return res.status(201).json(savedStudent);
        }

        await run(
            `INSERT INTO students (id, name, email, course, intake, gpa, status, contact, photo, enrolled_date, dob, address, guardian_name, guardian_contact, blood_group, completion_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, name, email, course, intake || 'January Intake',
                req.body.gpa || 0.0, req.body.status || 'Active', contact, photo,
                req.body.enrolled_date || new Date().toISOString().split('T')[0],
                dob, address, guardian_name, guardian_contact, blood_group, req.body.completion_date
            ]
        );

        // Create User Account for the student
        try {
            // Check if user already exists
            const existingUser = await queryOne('SELECT * FROM users WHERE email = ?', [email]);
            if (!existingUser) {
                const randomPassword = crypto.randomBytes(4).toString('hex'); // 8 char hex string
                const hashedPassword = await bcrypt.hash(randomPassword, 10);

                await createUser(email, hashedPassword, 'student');

                // Send email
                await sendWelcomeEmail(email, 'student', randomPassword);
                console.log(`✅ User account created and email sent for student: ${email}`);
            } else {
                console.log(`ℹ️ User account already exists for student: ${email}`);
            }
        } catch (userError) {
            console.error('Failed to create user account for student:', userError);
            // Don't block student registration if user creation fails, but log it.
        }

        const student = await queryOne('SELECT * FROM students WHERE id = ?', [id]);
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

        const fields = Object.keys(req.body).filter(k => k !== 'id');
        if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => req.body[f]);
        values.push(req.params.id);

        await run(`UPDATE students SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
        const student = await queryOne('SELECT * FROM students WHERE id = ?', [req.params.id]);
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

        const student = await queryOne('SELECT email FROM students WHERE id = ?', [req.params.id]);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        console.log(`🗑️ Deleting student ${student.email} and their user account...`);

        // Delete linked user account
        await run('DELETE FROM users WHERE email = ?', [student.email]);

        const result = await run('DELETE FROM students WHERE id = ?', [req.params.id]);
        if (result.changes === 0) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Student and linked user account deleted successfully' });
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

        const students = await query(
            `SELECT * FROM students WHERE name LIKE ? OR email LIKE ? OR id LIKE ? OR course LIKE ? ORDER BY created_at DESC`,
            [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
        );
        res.json(students);
    } catch (error) {
        console.error('Search students error:', error);
        res.status(500).json({ error: 'Failed to search students' });
    }
}
