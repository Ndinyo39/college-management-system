import { query, run } from '../config/database.js';

export async function getAllAttendance(req, res) {
    try {
        const { course, date } = req.query;
        let sql = 'SELECT * FROM attendance ORDER BY date DESC, student_id';
        let params = [];

        if (course && date) {
            sql = 'SELECT * FROM attendance WHERE course = ? AND date = ? ORDER BY student_id';
            params = [course, date];
        } else if (course) {
            sql = 'SELECT * FROM attendance WHERE course = ? ORDER BY date DESC, student_id';
            params = [course];
        } else if (date) {
            sql = 'SELECT * FROM attendance WHERE date = ? ORDER BY student_id';
            params = [date];
        }

        const attendance = await query(sql, params);
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
}

export async function markAttendance(req, res) {
    try {
        const { student_id, course, date, status } = req.body;

        await run(
            'INSERT OR REPLACE INTO attendance (student_id, course, date, status) VALUES (?, ?, ?, ?)',
            [student_id, course, date, status]
        );

        res.status(201).json({ message: 'Attendance marked successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
}

export async function updateAttendance(req, res) {
    try {
        const { status } = req.body;

        await run('UPDATE attendance SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Attendance updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update attendance' });
    }
}
