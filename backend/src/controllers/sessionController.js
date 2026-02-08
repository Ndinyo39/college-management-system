import { query, run } from '../config/database.js';

export const getAllSessions = async (req, res) => {
    try {
        const sessions = await query('SELECT * FROM sessions ORDER BY day, time');
        res.json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createSession = async (req, res) => {
    const { day, time, course, room, instructor, teacher_email } = req.body;

    if (!day || !time || !course || !room || !instructor) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const result = await run(
            'INSERT INTO sessions (day, time, course, room, instructor, teacher_email) VALUES (?, ?, ?, ?, ?, ?)',
            [day, time, course, room, instructor, teacher_email || 'staff@beautex.edu']
        );
        res.status(201).json({ id: result.lastID, message: 'Session created successfully' });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteSession = async (req, res) => {
    const { id } = req.params;
    try {
        await run('DELETE FROM sessions WHERE id = ?', [id]);
        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
