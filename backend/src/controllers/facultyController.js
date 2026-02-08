import { query, queryOne, run } from '../config/database.js';

export async function getAllFaculty(req, res) {
    try {
        const faculty = await query('SELECT * FROM faculty ORDER BY name');
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch faculty' });
    }
}

export async function getFaculty(req, res) {
    try {
        const member = await queryOne('SELECT * FROM faculty WHERE id = ?', [req.params.id]);
        if (!member) {
            return res.status(404).json({ error: 'Faculty member not found' });
        }
        res.json(member);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch faculty member' });
    }
}

export async function createFaculty(req, res) {
    try {
        const { id, name, email, department, courses, contact, passport } = req.body;

        const result = await run(
            'INSERT INTO faculty (id, name, email, department, courses, contact, passport) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, name, email, department, JSON.stringify(courses), contact, passport || null]
        );

        const newFaculty = await queryOne('SELECT * FROM faculty WHERE id = ?', [id]);
        res.status(201).json(newFaculty);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create faculty member' });
    }
}
