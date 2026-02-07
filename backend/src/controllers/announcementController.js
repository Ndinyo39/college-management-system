import { query, queryOne, run } from '../config/database.js';

export async function getAllAnnouncements(req, res) {
    try {
        const { category, priority } = req.query;
        let sql = 'SELECT * FROM announcements ORDER BY date DESC';
        let params = [];

        if (category && priority) {
            sql = 'SELECT * FROM announcements WHERE category = ? AND priority = ? ORDER BY date DESC';
            params = [category, priority];
        } else if (category) {
            sql = 'SELECT * FROM announcements WHERE category = ? ORDER BY date DESC';
            params = [category];
        } else if (priority) {
            sql = 'SELECT * FROM announcements WHERE priority = ? ORDER BY date DESC';
            params = [priority];
        }

        const announcements = await query(sql, params);
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
}

export async function createAnnouncement(req, res) {
    try {
        const { title, content, author, category, priority } = req.body;

        const result = await run(
            'INSERT INTO announcements (title, content, author, category, priority) VALUES (?, ?, ?, ?, ?)',
            [title, content, author, category, priority]
        );

        const newAnnouncement = await queryOne('SELECT * FROM announcements WHERE id = ?', [result.lastInsertRowid]);
        res.status(201).json(newAnnouncement);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create announcement' });
    }
}

export async function updateAnnouncement(req, res) {
    try {
        const { title, content, category, priority } = req.body;

        await run(
            'UPDATE announcements SET title = ?, content = ?, category = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [title, content, category, priority, req.params.id]
        );

        const updatedAnnouncement = await queryOne('SELECT * FROM announcements WHERE id = ?', [req.params.id]);
        res.json(updatedAnnouncement);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update announcement' });
    }
}

export async function deleteAnnouncement(req, res) {
    try {
        await run('DELETE FROM announcements WHERE id = ?', [req.params.id]);
        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
}
