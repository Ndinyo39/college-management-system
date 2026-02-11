import { getDb, query, queryOne, run } from '../config/database.js';
import { createUser } from './authController.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

async function isMongo() {
    const db = await getDb();
    return db.constructor.name === 'NativeConnection';
}

export async function getAllFaculty(req, res) {
    try {
        if (await isMongo()) {
            const Faculty = (await import('../models/mongo/Faculty.js')).default;
            const faculty = await Faculty.find().sort({ name: 1 });
            return res.json(faculty);
        }

        const faculty = await query('SELECT * FROM faculty ORDER BY name');
        res.json(faculty);
    } catch (error) {
        console.error('Get faculty error:', error);
        res.status(500).json({ error: 'Failed to fetch faculty' });
    }
}

export async function getFaculty(req, res) {
    try {
        if (await isMongo()) {
            const Faculty = (await import('../models/mongo/Faculty.js')).default;
            const faculty = await Faculty.findOne({ id: req.params.id });
            if (!faculty) return res.status(404).json({ error: 'Faculty not found' });
            return res.json(faculty);
        }

        const faculty = await queryOne('SELECT * FROM faculty WHERE id = ?', [req.params.id]);
        if (!faculty) return res.status(404).json({ error: 'Faculty not found' });
        res.json(faculty);
    } catch (error) {
        console.error('Get faculty error:', error);
        res.status(500).json({ error: 'Failed to fetch faculty' });
    }
}

export async function createFaculty(req, res) {
    try {
        const { id, name, email, department, courses, contact, passport, status } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Faculty ID is required.' });
        }

        if (await isMongo()) {
            const Faculty = (await import('../models/mongo/Faculty.js')).default;
            const newFaculty = new Faculty({ id, name, email, department, courses, contact, passport, status });
            const savedFaculty = await newFaculty.save();
            return res.status(201).json(savedFaculty);
        }

        const coursesStr = typeof courses === 'string' ? courses : JSON.stringify(courses || []);
        await run(
            'INSERT INTO faculty (id, name, email, department, position, specialization, courses, contact, passport, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, email, department, req.body.position || 'Instructor', req.body.specialization || department, coursesStr, contact, passport, status || 'Active']
        );

        // Create User Account for the faculty
        try {
            // Check if user already exists
            const existingUser = await queryOne('SELECT * FROM users WHERE email = ?', [email]);
            if (!existingUser) {
                const randomPassword = crypto.randomBytes(4).toString('hex'); // 8 char hex string
                const hashedPassword = await bcrypt.hash(randomPassword, 10);

                // Faculty role logic: Department Heads might be admins, but default to 'teacher'
                const userRole = 'teacher';

                await createUser(email, hashedPassword, userRole);

                // Send email
                await sendWelcomeEmail(email, userRole, randomPassword);
                console.log(`✅ User account created and email sent for faculty: ${email}`);
            } else {
                console.log(`ℹ️ User account already exists for faculty: ${email}`);
            }
        } catch (userError) {
            console.error('Failed to create user account for faculty:', userError);
        }

        const faculty = await queryOne('SELECT * FROM faculty WHERE id = ?', [id]);
        res.status(201).json(faculty);
    } catch (error) {
        console.error('Create faculty error:', error);
        res.status(500).json({ error: 'Failed to create faculty' });
    }
}

export async function updateFaculty(req, res) {
    try {
        if (await isMongo()) {
            const Faculty = (await import('../models/mongo/Faculty.js')).default;
            const updatedFaculty = await Faculty.findOneAndUpdate(
                { id: req.params.id },
                { $set: { ...req.body, updated_at: new Date() } },
                { new: true, runValidators: true }
            );
            if (!updatedFaculty) return res.status(404).json({ error: 'Faculty not found' });
            return res.json(updatedFaculty);
        }
        const fields = Object.keys(req.body).filter(k => k !== 'id');
        if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

        const values = fields.map(f => {
            if (f === 'courses' && typeof req.body[f] !== 'string') {
                return JSON.stringify(req.body[f]);
            }
            return req.body[f];
        });
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        values.push(req.params.id);

        await run(`UPDATE faculty SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
        const faculty = await queryOne('SELECT * FROM faculty WHERE id = ?', [req.params.id]);
        if (!faculty) return res.status(404).json({ error: 'Faculty not found' });
        res.json(faculty);
    } catch (error) {
        console.error('Update faculty error:', error);
        res.status(500).json({ error: 'Failed to update faculty' });
    }
}

export async function deleteFaculty(req, res) {
    try {
        if (await isMongo()) {
            const Faculty = (await import('../models/mongo/Faculty.js')).default;
            const result = await Faculty.findOneAndDelete({ id: req.params.id });
            if (!result) return res.status(404).json({ error: 'Faculty not found' });
            return res.json({ message: 'Faculty deleted successfully' });
        }

        const result = await run('DELETE FROM faculty WHERE id = ?', [req.params.id]);
        if (result.changes === 0) return res.status(404).json({ error: 'Faculty not found' });
        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        console.error('Delete faculty error:', error);
        res.status(500).json({ error: 'Failed to delete faculty' });
    }
}
