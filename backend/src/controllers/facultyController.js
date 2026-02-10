import { getDb } from '../config/database.js';

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

        const db = await getDb();
        const faculty = await db.all('SELECT * FROM faculty ORDER BY name');
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

        const db = await getDb();
        const faculty = await db.get('SELECT * FROM faculty WHERE id = ?', [req.params.id]);
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

        if (await isMongo()) {
            const Faculty = (await import('../models/mongo/Faculty.js')).default;
            const newFaculty = new Faculty({ id, name, email, department, courses, contact, passport, status });
            const savedFaculty = await newFaculty.save();
            return res.status(201).json(savedFaculty);
        }

        const db = await getDb();
        const coursesStr = typeof courses === 'string' ? courses : JSON.stringify(courses || []);
        await db.run(
            'INSERT INTO faculty (id, name, email, department, courses, contact, passport, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, email, department, coursesStr, contact, passport, status || 'Active']
        );
        const faculty = await db.get('SELECT * FROM faculty WHERE id = ?', [id]);
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

        const db = await getDb();
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

        await db.run(`UPDATE faculty SET ${setClause} WHERE id = ?`, values);
        const faculty = await db.get('SELECT * FROM faculty WHERE id = ?', [req.params.id]);
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

        const db = await getDb();
        const result = await db.run('DELETE FROM faculty WHERE id = ?', [req.params.id]);
        if (result.changes === 0) return res.status(404).json({ error: 'Faculty not found' });
        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        console.error('Delete faculty error:', error);
        res.status(500).json({ error: 'Failed to delete faculty' });
    }
}
