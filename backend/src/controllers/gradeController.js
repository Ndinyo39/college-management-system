import { query, queryOne, run } from '../config/database.js';

export async function getAllGrades(req, res) {
    try {
        const { course } = req.query;
        let sql = 'SELECT * FROM grades ORDER BY created_at DESC';
        let params = [];

        if (course) {
            sql = 'SELECT * FROM grades WHERE course = ? ORDER BY created_at DESC';
            params = [course];
        }

        const grades = await query(sql, params);
        res.json(grades);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch grades' });
    }
}

export async function createGrade(req, res) {
    try {
        const { student_id, course, assignment, score, max_score } = req.body;

        const result = await run(
            'INSERT INTO grades (student_id, course, assignment, score, max_score) VALUES (?, ?, ?, ?, ?)',
            [student_id, course, assignment, score, max_score]
        );

        const newGrade = await queryOne('SELECT * FROM grades WHERE id = ?', [result.lastInsertRowid]);
        res.status(201).json(newGrade);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create grade' });
    }
}

export async function updateGrade(req, res) {
    try {
        const { score, max_score } = req.body;

        await run(
            'UPDATE grades SET score = ?, max_score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [score, max_score, req.params.id]
        );

        const updatedGrade = await queryOne('SELECT * FROM grades WHERE id = ?', [req.params.id]);
        res.json(updatedGrade);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update grade' });
    }
}

export async function deleteGrade(req, res) {
    try {
        await run('DELETE FROM grades WHERE id = ?', [req.params.id]);
        res.json({ message: 'Grade deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete grade' });
    }
}
