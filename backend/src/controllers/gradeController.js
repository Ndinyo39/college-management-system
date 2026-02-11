import { getDb, query, queryOne, run } from '../config/database.js';

async function isMongo() {
    const db = await getDb();
    return db.constructor.name === 'NativeConnection';
}

export async function getAllGrades(req, res) {
    try {
        if (await isMongo()) {
            const Grade = (await import('../models/mongo/Grade.js')).default;
            const grades = await Grade.find().sort({ created_at: -1 });
            return res.json(grades);
        }

        const grades = await query('SELECT * FROM grades ORDER BY id DESC LIMIT 1000');
        res.json(grades);
    } catch (error) {
        console.error('Get grades error:', error);
        res.status(500).json({ error: 'Failed to fetch grades' });
    }
}

export async function createGrade(req, res) {
    try {
        const { student_id, course, assignment, score, max_score } = req.body;

        if (await isMongo()) {
            const Grade = (await import('../models/mongo/Grade.js')).default;
            const newGrade = new Grade({ student_id, course, assignment, score, max_score });
            const saved = await newGrade.save();
            return res.status(201).json(saved);
        }

        await run(
            'INSERT INTO grades (student_id, course, assignment, score, max_score) VALUES (?, ?, ?, ?, ?)',
            [student_id, course, assignment, score, max_score]
        );
        const grade = await queryOne('SELECT * FROM grades WHERE student_id = ? AND course = ? AND assignment = ? ORDER BY id DESC LIMIT 1', [student_id, course, assignment]);
        res.status(201).json(grade);
    } catch (error) {
        console.error('Create grade error:', error);
        res.status(500).json({ error: 'Failed to create grade' });
    }
}

export async function updateGrade(req, res) {
    try {
        if (await isMongo()) {
            const Grade = (await import('../models/mongo/Grade.js')).default;
            const updated = await Grade.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
            if (!updated) return res.status(404).json({ error: 'Grade not found' });
            return res.json(updated);
        }

        const fields = Object.keys(req.body);
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => req.body[f]);
        values.push(req.params.id);

        await run(`UPDATE grades SET ${setClause} WHERE id = ?`, values);
        const grade = await queryOne('SELECT * FROM grades WHERE id = ?', [req.params.id]);
        if (!grade) return res.status(404).json({ error: 'Grade not found' });
        res.json(grade);
    } catch (error) {
        console.error('Update grade error:', error);
        res.status(500).json({ error: 'Failed to update grade' });
    }
}

export async function deleteGrade(req, res) {
    try {
        if (await isMongo()) {
            const Grade = (await import('../models/mongo/Grade.js')).default;
            const result = await Grade.findByIdAndDelete(req.params.id);
            if (!result) return res.status(404).json({ error: 'Grade not found' });
            return res.json({ message: 'Grade deleted successfully' });
        }

        const result = await run('DELETE FROM grades WHERE id = ?', [req.params.id]);
        if (result.changes === 0) return res.status(404).json({ error: 'Grade not found' });
        res.json({ message: 'Grade deleted successfully' });
    } catch (error) {
        console.error('Delete grade error:', error);
        res.status(500).json({ error: 'Failed to delete grade' });
    }
}
